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
    # period_end = day before first_of_this_month
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


def _build_prompt(user, transactions_qs, period_start, period_end, language):
    lang_names = {"fr": "French", "ar": "Arabic", "en": "English"}
    lang_label = lang_names.get(language, "French")

    agg = (
        transactions_qs
        .values("type")
        .annotate(total=Sum("amount"))
    )
    summary_lines = [f"  {row['type']}: {row['total']} MAD" for row in agg]
    summary = "\n".join(summary_lines) or "  No transactions"

    top_categories = (
        transactions_qs
        .filter(type__in=["expense", "bill"])
        .values("category__name_fr")
        .annotate(total=Sum("amount"))
        .order_by("-total")[:5]
    )
    cat_lines = [f"  {row['category__name_fr']}: {row['total']} MAD" for row in top_categories]
    cat_summary = "\n".join(cat_lines) or "  None"

    return f"""You are a personal finance advisor for a Moroccan user.
Analyze the following transaction data for {period_start} to {period_end} and generate a single financial insight.

Transaction summary:
{summary}

Top expense categories:
{cat_summary}

Respond ONLY with a valid JSON object (no markdown, no code fences) with these exact fields:
- "type": one of "breakdown", "anomaly", or "awareness"
- "title": short title (max 80 chars) in {lang_label}
- "body": insight text (2-4 sentences) in {lang_label}
- "severity": one of "info", "warning", or "critical"

JSON:"""


class Command(BaseCommand):
    help = "Generate AI insights for all users using Claude API"

    def add_arguments(self, parser):
        parser.add_argument(
            "--period",
            type=str,
            default=None,
            help="Period in YYYY-MM format. Defaults to previous month.",
        )

    def handle(self, *args, **options):
        import anthropic

        period_str = options.get("period")
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

            language = user.preferred_language or "fr"
            prompt = _build_prompt(user, transactions_qs, period_start, period_end, language)

            try:
                response = client.messages.create(
                    model="claude-opus-4-6",
                    max_tokens=512,
                    messages=[{"role": "user", "content": prompt}],
                )
                raw = response.content[0].text.strip()
                data = json.loads(raw)

                AIInsight.objects.create(
                    user=user,
                    type=data["type"],
                    title=data["title"],
                    body=data["body"],
                    severity=data.get("severity", "info"),
                    language=language,
                    period_start=period_start,
                    period_end=period_end,
                )
                created_count += 1
                self.stdout.write(f"  Created insight for {user.email}")

            except Exception as e:
                self.stderr.write(f"  Failed for {user.email}: {e}")

        self.stdout.write(self.style.SUCCESS(f"Done. Created {created_count} insights."))
