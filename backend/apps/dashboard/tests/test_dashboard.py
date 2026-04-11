import pytest
from datetime import date
from decimal import Decimal
from rest_framework import status
from apps.accounts.tests.factories import UserFactory, AccountFactory
from apps.categories.tests.factories import CategoryFactory
from apps.transactions.tests.factories import TransactionFactory
from apps.transactions.models import RecurringBill
from apps.budgets.models import Budget


@pytest.mark.django_db
class TestDashboardView:
    url = "/api/v1/dashboard/"

    def test_unauthenticated_returns_401(self, api_client):
        response = api_client.get(self.url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_dashboard_returns_200(self, authenticated_client):
        response = authenticated_client.get(self.url)
        assert response.status_code == status.HTTP_200_OK

    def test_dashboard_has_required_keys(self, authenticated_client):
        response = authenticated_client.get(self.url)
        data = response.data
        assert "accounts" in data
        assert "recent_transactions" in data
        assert "monthly_summary" in data
        assert "unread_insights_count" in data
        assert "budget_progress" in data

    def test_accounts_includes_balances(self, authenticated_client, user):
        account = AccountFactory(user=user, name="CIH", balance="10000.00")
        # user already has default Cash account from signal
        response = authenticated_client.get(self.url)
        names = [a["name"] for a in response.data["accounts"]]
        assert "CIH" in names
        assert "Cash" in names

    def test_recent_transactions_limited_to_10(self, authenticated_client, user):
        account = AccountFactory(user=user)
        category = CategoryFactory(user=user)
        for i in range(12):
            TransactionFactory(user=user, account=account, category=category, date=date.today())
        response = authenticated_client.get(self.url)
        assert len(response.data["recent_transactions"]) <= 10

    def test_recent_transactions_only_own(self, authenticated_client, user):
        other = UserFactory()
        other_account = AccountFactory(user=other)
        other_cat = CategoryFactory(user=other)
        TransactionFactory(user=other, account=other_account, category=other_cat)
        response = authenticated_client.get(self.url)
        assert len(response.data["recent_transactions"]) == 0

    def test_monthly_summary_has_income_expense_net(self, authenticated_client, user):
        account = AccountFactory(user=user)
        category = CategoryFactory(user=user)
        TransactionFactory(user=user, account=account, category=category,
                           type="income", amount="5000.00", date=date.today())
        TransactionFactory(user=user, account=account, category=category,
                           type="expense", amount="1500.00", date=date.today())
        response = authenticated_client.get(self.url)
        summary = response.data["monthly_summary"]
        assert Decimal(summary["income"]) == Decimal("5000.00")
        assert Decimal(summary["expense"]) == Decimal("1500.00")
        assert Decimal(summary["net"]) == Decimal("3500.00")

    def test_unread_insights_count_is_integer(self, authenticated_client):
        response = authenticated_client.get(self.url)
        assert isinstance(response.data["unread_insights_count"], int)
        assert response.data["unread_insights_count"] == 0

    def test_budget_progress_includes_spent_and_limit(self, authenticated_client, user):
        account = AccountFactory(user=user)
        category = CategoryFactory(user=user)
        Budget.objects.create(
            user=user, category=category,
            amount="2000.00", month=date.today().replace(day=1)
        )
        TransactionFactory(user=user, account=account, category=category,
                           type="expense", amount="750.00", date=date.today())
        response = authenticated_client.get(self.url)
        progress = response.data["budget_progress"]
        assert len(progress) == 1
        assert "category_id" in progress[0]
        assert "limit" in progress[0]
        assert "spent" in progress[0]
        assert "remaining" in progress[0]
        assert Decimal(progress[0]["spent"]) == Decimal("750.00")
        assert Decimal(progress[0]["limit"]) == Decimal("2000.00")
        assert Decimal(progress[0]["remaining"]) == Decimal("1250.00")

    def test_dashboard_only_own_data(self, authenticated_client, user):
        other = UserFactory()
        other_account = AccountFactory(user=other, balance="99999.00")
        response = authenticated_client.get(self.url)
        account_names = [a["name"] for a in response.data["accounts"]]
        assert other_account.name not in account_names
