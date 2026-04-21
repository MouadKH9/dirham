import pytest
from datetime import date
from decimal import Decimal
from rest_framework import status
from apps.accounts.tests.factories import UserFactory
from apps.categories.tests.factories import CategoryFactory
from apps.budgets.models import Budget


def make_budget(user, category=None, **kwargs):
    if category is None:
        category = CategoryFactory(user=user)
    budget = Budget.objects.create(
        user=user,
        name=kwargs.get("name", ""),
        amount=kwargs.get("amount", "1000.00"),
        month=kwargs.get("month", date(2026, 4, 1)),
    )
    budget.categories.set(kwargs.get("categories", [category]))
    return budget


@pytest.mark.django_db
class TestBudgetModel:
    def test_create_budget(self):
        user = UserFactory()
        budget = make_budget(user)
        import uuid
        assert isinstance(budget.id, uuid.UUID)
        budget.refresh_from_db()
        assert budget.amount == Decimal("1000.00")
        assert budget.month == date(2026, 4, 1)

    def test_str(self):
        user = UserFactory()
        cat = CategoryFactory(user=user, name_fr="Alimentation")
        budget = make_budget(user, category=cat, month=date(2026, 4, 1))
        assert "2026-04" in str(budget)


@pytest.mark.django_db
class TestBudgetListCreateView:
    url = "/api/v1/budgets/"

    def test_list_own_budgets(self, authenticated_client, user):
        make_budget(user)
        other = UserFactory()
        make_budget(other)
        response = authenticated_client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 1

    def test_create_budget(self, authenticated_client, user):
        category = CategoryFactory(user=user)
        data = {
            "name": "Essentials",
            "categories": [str(category.id)],
            "amount": "2000.00",
            "month": "2026-05-01",
        }
        response = authenticated_client.post(self.url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["name"] == "Essentials"
        assert response.data["amount"] == "2000.00"
        assert [str(category_id) for category_id in response.data["categories"]] == [str(category.id)]

    def test_unauthenticated_returns_401(self, api_client):
        response = api_client.get(self.url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestBudgetDetailView:
    def test_patch_budget_amount(self, authenticated_client, user):
        budget = make_budget(user)
        response = authenticated_client.patch(f"/api/v1/budgets/{budget.id}/", {"amount": "1500.00"})
        assert response.status_code == status.HTTP_200_OK
        assert response.data["amount"] == "1500.00"

    def test_cannot_access_other_users_budget(self, authenticated_client):
        other = UserFactory()
        budget = make_budget(other)
        response = authenticated_client.get(f"/api/v1/budgets/{budget.id}/")
        assert response.status_code == status.HTTP_404_NOT_FOUND
