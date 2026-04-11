import pytest
from apps.accounts.models import User, Account


@pytest.mark.django_db
class TestDefaultAccountSignal:
    def test_cash_account_created_on_user_creation(self):
        user = User.objects.create_user(email="signal@example.com", password="pass1234")
        assert Account.objects.filter(user=user, name="Cash").exists()

    def test_cash_account_is_manual_type(self):
        user = User.objects.create_user(email="manual@example.com", password="pass1234")
        account = Account.objects.get(user=user, name="Cash")
        assert account.type == Account.AccountType.MANUAL

    def test_cash_account_inherits_preferred_currency(self):
        user = User.objects.create_user(
            email="currency@example.com", password="pass1234", preferred_currency="USD"
        )
        account = Account.objects.get(user=user, name="Cash")
        assert account.currency == "USD"

    def test_only_one_cash_account_created(self):
        user = User.objects.create_user(email="once@example.com", password="pass1234")
        assert Account.objects.filter(user=user).count() == 1
