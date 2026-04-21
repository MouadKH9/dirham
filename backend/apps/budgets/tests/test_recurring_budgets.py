from datetime import date

import pytest
from django.core.management import call_command
from rest_framework import status

from apps.accounts.tests.factories import UserFactory
from apps.budgets.models import Budget, RecurringBudget
from apps.budgets.services import generate_recurring_budgets_for_month
from apps.categories.tests.factories import CategoryFactory


def make_recurring_budget(user, categories=None, **kwargs):
    recurring = RecurringBudget.objects.create(
        user=user,
        name=kwargs.get("name", "Recurring essentials"),
        amount=kwargs.get("amount", "900.00"),
        start_month=kwargs.get("start_month", date(2026, 4, 1)),
        is_active=kwargs.get("is_active", True),
    )
    if categories is None:
        categories = [CategoryFactory(user=user)]
    recurring.categories.set(categories)
    return recurring


@pytest.mark.django_db
class TestRecurringBudgetApi:
    url = "/api/v1/recurring-budgets/"

    def test_create_recurring_budget(self, authenticated_client, user):
        category = CategoryFactory(user=user)
        response = authenticated_client.post(
            self.url,
            {
                "name": "Monthly transport cap",
                "categories": [str(category.id)],
                "amount": "700.00",
                "start_month": "2026-05-01",
                "is_active": True,
            },
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["name"] == "Monthly transport cap"
        assert response.data["start_month"] == "2026-05-01"
        assert response.data["is_active"] is True

    def test_list_own_recurring_budgets(self, authenticated_client, user):
        make_recurring_budget(user)
        other = UserFactory()
        make_recurring_budget(other)

        response = authenticated_client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 1


@pytest.mark.django_db
class TestRecurringBudgetGeneration:
    def test_generate_creates_budget_row(self, user):
        category = CategoryFactory(user=user)
        recurring = make_recurring_budget(
            user,
            categories=[category],
            name="Family essentials",
            start_month=date(2026, 4, 1),
        )

        result = generate_recurring_budgets_for_month(date(2026, 6, 1))

        assert result["created"] == 1
        budget = Budget.objects.get(source_recurring_budget=recurring, month=date(2026, 6, 1))
        assert budget.name == "Family essentials"
        assert list(budget.categories.values_list("id", flat=True)) == [category.id]

    def test_generate_skips_existing_manual_budget_same_shape(self, user):
        category = CategoryFactory(user=user)
        make_recurring_budget(
            user,
            categories=[category],
            name="Transport cap",
            start_month=date(2026, 4, 1),
        )
        manual = Budget.objects.create(
            user=user,
            name="Transport cap",
            amount="500.00",
            month=date(2026, 6, 1),
        )
        manual.categories.set([category])

        result = generate_recurring_budgets_for_month(date(2026, 6, 1))
        assert result["created"] == 0
        assert result["skipped"] == 1
        assert Budget.objects.filter(user=user, month=date(2026, 6, 1)).count() == 1

    def test_generate_skips_when_already_generated(self, user):
        category = CategoryFactory(user=user)
        make_recurring_budget(user, categories=[category], start_month=date(2026, 4, 1))

        first = generate_recurring_budgets_for_month(date(2026, 6, 1))
        second = generate_recurring_budgets_for_month(date(2026, 6, 1))

        assert first["created"] == 1
        assert second["created"] == 0
        assert second["skipped"] == 1

    def test_budget_list_endpoint_triggers_current_month_generation(self, authenticated_client, user):
        current_month = date.today().replace(day=1)
        category = CategoryFactory(user=user)
        make_recurring_budget(
            user,
            categories=[category],
            name="Triggered on list",
            start_month=current_month,
        )

        response = authenticated_client.get("/api/v1/budgets/")
        assert response.status_code == status.HTTP_200_OK
        assert Budget.objects.filter(user=user, month=current_month).count() == 1


@pytest.mark.django_db
def test_generate_recurring_budgets_command():
    user = UserFactory()
    category = CategoryFactory(user=user)
    make_recurring_budget(
        user,
        categories=[category],
        name="Command generated",
        start_month=date(2026, 5, 1),
    )

    call_command("generate_recurring_budgets", month="2026-06")

    assert Budget.objects.filter(user=user, month=date(2026, 6, 1)).count() == 1
