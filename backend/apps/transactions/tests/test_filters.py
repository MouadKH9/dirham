import pytest
from datetime import date
from apps.accounts.tests.factories import UserFactory, AccountFactory
from apps.categories.tests.factories import CategoryFactory
from .factories import TransactionFactory


@pytest.mark.django_db
class TestTransactionFilters:
    url = "/api/v1/transactions/"

    def setup_method(self):
        pass

    def test_filter_by_account(self, authenticated_client, user):
        account1 = AccountFactory(user=user)
        account2 = AccountFactory(user=user)
        TransactionFactory(user=user, account=account1)
        TransactionFactory(user=user, account=account2)
        response = authenticated_client.get(self.url + f"?account={account1.id}")
        assert response.data["count"] == 1

    def test_filter_by_category(self, authenticated_client, user):
        account = AccountFactory(user=user)
        cat1 = CategoryFactory(user=user)
        cat2 = CategoryFactory(user=user)
        TransactionFactory(user=user, account=account, category=cat1)
        TransactionFactory(user=user, account=account, category=cat2)
        response = authenticated_client.get(self.url + f"?category={cat1.id}")
        assert response.data["count"] == 1

    def test_filter_by_type(self, authenticated_client, user):
        account = AccountFactory(user=user)
        category = CategoryFactory(user=user)
        TransactionFactory(user=user, account=account, category=category, type="income")
        TransactionFactory(user=user, account=account, category=category, type="expense")
        response = authenticated_client.get(self.url + "?type=income")
        assert response.data["count"] == 1

    def test_filter_by_date_from(self, authenticated_client, user):
        account = AccountFactory(user=user)
        category = CategoryFactory(user=user)
        TransactionFactory(user=user, account=account, category=category, date=date(2026, 3, 1))
        TransactionFactory(user=user, account=account, category=category, date=date(2026, 4, 1))
        response = authenticated_client.get(self.url + "?date_from=2026-04-01")
        assert response.data["count"] == 1

    def test_filter_by_date_to(self, authenticated_client, user):
        account = AccountFactory(user=user)
        category = CategoryFactory(user=user)
        TransactionFactory(user=user, account=account, category=category, date=date(2026, 3, 1))
        TransactionFactory(user=user, account=account, category=category, date=date(2026, 4, 1))
        response = authenticated_client.get(self.url + "?date_to=2026-03-31")
        assert response.data["count"] == 1

    def test_filter_by_date_range(self, authenticated_client, user):
        account = AccountFactory(user=user)
        category = CategoryFactory(user=user)
        TransactionFactory(user=user, account=account, category=category, date=date(2026, 2, 1))
        TransactionFactory(user=user, account=account, category=category, date=date(2026, 3, 15))
        TransactionFactory(user=user, account=account, category=category, date=date(2026, 5, 1))
        response = authenticated_client.get(self.url + "?date_from=2026-03-01&date_to=2026-04-30")
        assert response.data["count"] == 1

    def test_search_by_notes(self, authenticated_client, user):
        account = AccountFactory(user=user)
        category = CategoryFactory(user=user)
        TransactionFactory(user=user, account=account, category=category, notes="Café Bacha")
        TransactionFactory(user=user, account=account, category=category, notes="Marjane courses")
        response = authenticated_client.get(self.url + "?search=bacha")
        assert response.data["count"] == 1

    def test_combined_filters(self, authenticated_client, user):
        account = AccountFactory(user=user)
        cat = CategoryFactory(user=user)
        TransactionFactory(user=user, account=account, category=cat, type="expense", date=date(2026, 4, 1))
        TransactionFactory(user=user, account=account, category=cat, type="income", date=date(2026, 4, 1))
        TransactionFactory(user=user, account=account, category=cat, type="expense", date=date(2026, 3, 1))
        response = authenticated_client.get(self.url + f"?type=expense&date_from=2026-04-01")
        assert response.data["count"] == 1
