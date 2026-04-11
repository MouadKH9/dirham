import pytest
from datetime import date
from decimal import Decimal
from rest_framework import status
from apps.accounts.tests.factories import UserFactory, AccountFactory
from apps.categories.tests.factories import CategoryFactory
from apps.transactions.models import Transaction
from .factories import TransactionFactory


@pytest.mark.django_db
class TestTransactionListCreateView:
    url = "/api/v1/transactions/"

    def test_list_returns_only_own_transactions(self, authenticated_client, user):
        account = AccountFactory(user=user)
        TransactionFactory(user=user, account=account)
        other_user = UserFactory()
        TransactionFactory(user=other_user, account=AccountFactory(user=other_user))
        response = authenticated_client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 1

    def test_create_transaction(self, authenticated_client, user):
        account = AccountFactory(user=user)
        category = CategoryFactory(user=user)
        data = {
            "account": str(account.id),
            "category": str(category.id),
            "type": "expense",
            "amount": "150.00",
            "date": str(date.today()),
        }
        response = authenticated_client.post(self.url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["amount"] == "150.00"

    def test_unauthenticated_returns_401(self, api_client):
        response = api_client.get(self.url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestTransactionDetailView:
    def test_retrieve_own_transaction(self, authenticated_client, user):
        account = AccountFactory(user=user)
        t = TransactionFactory(user=user, account=account)
        response = authenticated_client.get(f"/api/v1/transactions/{t.id}/")
        assert response.status_code == status.HTTP_200_OK

    def test_cannot_retrieve_other_users_transaction(self, authenticated_client):
        other_user = UserFactory()
        t = TransactionFactory(user=other_user, account=AccountFactory(user=other_user))
        response = authenticated_client.get(f"/api/v1/transactions/{t.id}/")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_patch_transaction(self, authenticated_client, user):
        account = AccountFactory(user=user)
        t = TransactionFactory(user=user, account=account)
        response = authenticated_client.patch(f"/api/v1/transactions/{t.id}/", {"notes": "Updated"})
        assert response.status_code == status.HTTP_200_OK
        assert response.data["notes"] == "Updated"

    def test_delete_transaction(self, authenticated_client, user):
        account = AccountFactory(user=user)
        t = TransactionFactory(user=user, account=account)
        response = authenticated_client.delete(f"/api/v1/transactions/{t.id}/")
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Transaction.objects.filter(id=t.id).exists()

    def test_cannot_delete_other_users_transaction(self, authenticated_client):
        other_user = UserFactory()
        t = TransactionFactory(user=other_user, account=AccountFactory(user=other_user))
        response = authenticated_client.delete(f"/api/v1/transactions/{t.id}/")
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestTransactionSummaryView:
    url = "/api/v1/transactions/summary/"

    def test_summary_default_current_month(self, authenticated_client, user):
        account = AccountFactory(user=user)
        category = CategoryFactory(user=user)
        TransactionFactory(
            user=user, account=account, category=category,
            type="income", amount="2000.00", date=date.today()
        )
        TransactionFactory(
            user=user, account=account, category=category,
            type="expense", amount="500.00", date=date.today()
        )
        response = authenticated_client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        assert Decimal(response.data["income"]) == Decimal("2000.00")
        assert Decimal(response.data["expense"]) == Decimal("500.00")
        assert Decimal(response.data["net"]) == Decimal("1500.00")

    def test_summary_specific_month(self, authenticated_client, user):
        account = AccountFactory(user=user)
        category = CategoryFactory(user=user)
        TransactionFactory(
            user=user, account=account, category=category,
            type="expense", amount="300.00", date=date(2026, 1, 15)
        )
        response = authenticated_client.get(self.url + "?month=2026-01")
        assert response.status_code == status.HTTP_200_OK
        assert Decimal(response.data["expense"]) == Decimal("300.00")
        assert response.data["month"] == "2026-01"

    def test_summary_excludes_other_months(self, authenticated_client, user):
        account = AccountFactory(user=user)
        category = CategoryFactory(user=user)
        TransactionFactory(
            user=user, account=account, category=category,
            type="expense", amount="999.00", date=date(2025, 12, 1)
        )
        response = authenticated_client.get(self.url + "?month=2026-01")
        assert Decimal(response.data["expense"]) == Decimal("0.00")

    def test_summary_excludes_other_users(self, authenticated_client, user):
        other_user = UserFactory()
        other_account = AccountFactory(user=other_user)
        category = CategoryFactory(user=other_user)
        TransactionFactory(
            user=other_user, account=other_account, category=category,
            type="expense", amount="999.00", date=date.today()
        )
        response = authenticated_client.get(self.url)
        assert Decimal(response.data["expense"]) == Decimal("0.00")

    def test_summary_invalid_month_param(self, authenticated_client):
        response = authenticated_client.get(self.url + "?month=bad-input")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
