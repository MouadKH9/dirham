from datetime import date
from typing import Optional

from .models import Budget, RecurringBudget


def month_start(value: Optional[date] = None) -> date:
    base = value or date.today()
    return base.replace(day=1)


def parse_month(value: str) -> date:
    year, month = map(int, value.split("-"))
    return date(year, month, 1)


def generate_recurring_budgets_for_month(target_month: date, user=None) -> dict[str, int]:
    target_month = month_start(target_month)
    templates = RecurringBudget.objects.filter(
        is_active=True,
        start_month__lte=target_month,
    ).prefetch_related("categories")
    if user is not None:
        templates = templates.filter(user=user)

    created = 0
    skipped = 0

    for template in templates:
        template_category_ids = set(template.categories.values_list("id", flat=True))
        if not template_category_ids:
            skipped += 1
            continue

        existing_for_month = Budget.objects.filter(
            user=template.user,
            month=target_month,
        ).prefetch_related("categories")

        template_name = (template.name or "").strip()
        has_conflict = False
        for existing in existing_for_month:
            if existing.source_recurring_budget_id == template.id:
                has_conflict = True
                break

            existing_name = (existing.name or "").strip()
            if existing_name != template_name:
                continue

            existing_category_ids = set(existing.categories.values_list("id", flat=True))
            if existing_category_ids == template_category_ids:
                has_conflict = True
                break

        if has_conflict:
            skipped += 1
            continue

        budget = Budget.objects.create(
            user=template.user,
            source_recurring_budget=template,
            name=template.name,
            amount=template.amount,
            month=target_month,
        )
        budget.categories.set(template_category_ids)
        created += 1

    return {"created": created, "skipped": skipped}


def ensure_recurring_budgets_for_current_month(user) -> dict[str, int]:
    return generate_recurring_budgets_for_month(month_start(), user=user)
