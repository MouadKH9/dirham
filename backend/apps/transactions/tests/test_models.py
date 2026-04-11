import pytest
import uuid
from apps.transactions.models import Transaction
from .factories import TransactionFactory


@pytest.mark.django_db
class TestTransactionModel:
    def test_create_transaction(self):
        t = TransactionFactory()
        assert t.id is not None
        assert isinstance(t.id, uuid.UUID)
        assert t.amount > 0
        assert t.source == "manual"

    def test_transaction_str(self):
        t = TransactionFactory(type="expense", amount="100.00")
        assert "expense" in str(t) or "100" in str(t)

    def test_default_ordering_by_date_desc(self):
        from datetime import date, timedelta
        user = TransactionFactory().user
        t1 = TransactionFactory(user=user, account__user=user, date=date.today() - timedelta(days=2))
        t2 = TransactionFactory(user=user, account__user=user, date=date.today() - timedelta(days=1))
        t3 = TransactionFactory(user=user, account__user=user, date=date.today())
        qs = list(Transaction.objects.filter(user=user))
        assert qs[0].date >= qs[1].date >= qs[2].date
