import json
from datetime import date
from django.core.management.base import BaseCommand
from django.conf import settings
from django.db.models import Sum
from apps.accounts.models import User
from apps.transactions.models import Transaction
from apps.insights.models import AIInsight


def _previous_month_range(today=None):
    if today is None:
        today = date.today()
    first_of_this_month = today.replace(day=1)
    if first_of_this_month.month == 1:
        period_start = date(first_of_this_month.year - 1, 12, 1)
    else:
        period_start = date(first_of_this_month.year, first_of_this_month.month - 1, 1)
    period_end = first_of_this_month.replace(day=1) - __import__("datetime").timedelta(days=1)
    return period_start, period_end


def _parse_period(period_str):
    year, month = map(int, period_str.split("-"))
    period_start = date(year, month, 1)
    if month == 12:
        period_end = date(year + 1, 1, 1) - __import__("datetime").timedelta(days=1)
    else:
        period_end = date(year, month + 1, 1) - __import__("datetime").timedelta(days=1)
    return period_start, period_end


def _build_metadata(transactions_qs, language):
    name_field = f"category__name_{language}"

    total_spent = (
        transactions_qs
        .filter(type__in=["expense", "bill"])
        .aggregate(s=Sum("amount"))["s"] or 0
    )

    top_categories = list(
        transactions_qs
        .filter(type__in=["expense", "bill"])
        .values(name_field)
        .annotate(total=Sum("amount"))
        .order_by("-total")[:5]
    )

    type_totals = {
        row["type"]: float(row["total"])
        for row in transactions_qs.values("type").annotate(total=Sum("amount"))
    }

    return {
        "total_transactions": transactions_qs.count(),
        "total_spent_mad": float(total_spent),
        "top_categories": [
            {"name": row[name_field] or "", "amount": float(row["total"])}
            for row in top_categories
        ],
        "totals_by_type": type_totals,
    }


def _build_prompt(transactions_qs, period_start, period_end, language, metadata):
    lang_names = {"fr": "French", "ar": "Arabic", "en": "English"}
    lang_label = lang_names.get(language, "French")

    type_lines = "\n".join(
        f"  {t}: {a} MAD" for t, a in metadata["totals_by_type"].items()
    ) or "  No transactions"

    cat_lines = "\n".join(
        f"  {c['name']}: {c['amount']} MAD" for c in metadata["top_categories"]
    ) or "  None"

    return f"""You are a personal finance advisor for a Moroccan user.
Analyze the following transaction data for {period_start} to {period_end} and generate 1 to 3 financial insights.

Transaction summary:
{type_lines}

Top expense categories:
{cat_lines}

Respond ONLY with a valid JSON array (no markdown, no code fences). Each element must have:
- "type": one of "breakdown", "anomaly", or "awareness"
- "title": short title (max 80 chars) in {lang_label}
- "body": insight text (2-4 sentences) in {lang_label}
- "severity": one of "info", "warning", or "critical"

Include only types where you have something meaningful to say. Do not repeat the same type twice.

JSON array:"""


class Command(BaseCommand):
    help = "Generate AI insights for all users using Claude API"

    def add_arguments(self, parser):
        parser.add_argument(
            "--period",
            type=str,
            default=None,
            help="Period in YYYY-MM format. Defaults to previous month.",
        )
        parser.add_argument(
            "--overwrite",
            action="store_true",
            default=False,
            help="Delete existing insights for the period before regenerating.",
        )

    def handle(self, *args, **options):
        import anthropic

        period_str = options.get("period")
        overwrite = options.get("overwrite", False)

        if period_str:
            period_start, period_end = _parse_period(period_str)
        else:
            period_start, period_end = _previous_month_range()

        self.stdout.write(f"Generating insights for {period_start} to {period_end}")

        client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

        users = User.objects.filter(is_active=True)
        created_count = 0

        for user in users:
            transactions_qs = Transaction.objects.filter(
                user=user,
                date__gte=period_start,
                date__lte=period_end,
            )

            if not transactions_qs.exists():
                continue

            existing = AIInsight.objects.filter(
                user=user,
                period_start=period_start,
                period_end=period_end,
            )

            if existing.exists():
                if overwrite:
                    existing.delete()
                    self.stdout.write(f"  Deleted existing insights for {user.email}")
                else:
                    self.stdout.write(
                        f"  Skipping {user.email} — insights already exist "
                        f"(use --overwrite to regenerate)"
                    )
                    continue

            language = user.preferred_language or "fr"
            metadata = _build_metadata(transactions_qs, language)
            prompt = _build_prompt(
                transactions_qs, period_start, period_end, language, metadata
            )

            try:
                response = client.messages.create(
                    model="claude-haiku-4-5-20251001",
                    max_tokens=1024,
                    messages=[{"role": "user", "content": prompt}],
                )
                raw = response.content[0].text.strip()
                items = json.loads(raw)

                if not isinstance(items, list):
                    items = [items]

                for item in items:
                    AIInsight.objects.create(
                        user=user,
                        type=item["type"],
                        title=item["title"],
                        body=item["body"],
                        severity=item.get("severity", "info"),
                        language=language,
                        period_start=period_start,
                        period_end=period_end,
                        metadata=metadata,
                    )
                    created_count += 1

                self.stdout.write(
                    f"  Created {len(items)} insight(s) for {user.email}"
                )

            except Exception as e:
                self.stderr.write(f"  Failed for {user.email}: {e}")

        self.stdout.write(self.style.SUCCESS(f"Done. Created {created_count} insights."))
