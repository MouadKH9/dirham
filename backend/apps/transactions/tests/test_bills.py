import pytest
from datetime import date
from rest_framework import status
from apps.accounts.tests.factories import UserFactory, AccountFactory
from apps.categories.tests.factories import CategoryFactory
from apps.transactions.models import RecurringBill, Transaction
from .factories import TransactionFactory


def make_bill(user, category=None, **kwargs):
    if category is None:
        category = CategoryFactory(user=user)
    return RecurringBill.objects.create(
        user=user,
        category=category,
        name=kwargs.get("name", "Loyer"),
        amount=kwargs.get("amount", "3500.00"),
        frequency=kwargs.get("frequency", "monthly"),
        next_due_date=kwargs.get("next_due_date", date(2026, 5, 1)),
        is_active=kwargs.get("is_active", True),
    )


@pytest.mark.django_db
class TestRecurringBillModel:
    def test_create_bill(self):
        from apps.accounts.tests.factories import UserFactory
        user = UserFactory()
        bill = make_bill(user)
        import uuid
        assert isinstance(bill.id, uuid.UUID)
        assert bill.frequency == "monthly"
        assert bill.is_active

    def test_str(self):
        user = UserFactory()
        bill = make_bill(user, name="Netflix")
        assert "Netflix" in str(bill)


@pytest.mark.django_db
class TestBillListCreateView:
    url = "/api/v1/bills/"

    def test_list_own_bills(self, authenticated_client, user):
        make_bill(user, name="Loyer")
        other = UserFactory()
        make_bill(other, name="Inwi")
        response = authenticated_client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        names = [b["name"] for b in response.data["results"]]
        assert "Loyer" in names
        assert "Inwi" not in names

    def test_create_bill(self, authenticated_client, user):
        category = CategoryFactory(user=user)
        data = {
            "category": str(category.id),
            "name": "Inwi",
            "amount": "199.00",
            "frequency": "monthly",
            "next_due_date": "2026-05-01",
        }
        response = authenticated_client.post(self.url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["name"] == "Inwi"

    def test_unauthenticated_returns_401(self, api_client):
        response = api_client.get(self.url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestBillDetailView:
    def test_patch_own_bill(self, authenticated_client, user):
        bill = make_bill(user, name="Gym")
        response = authenticated_client.patch(f"/api/v1/bills/{bill.id}/", {"amount": "250.00"})
        assert response.status_code == status.HTTP_200_OK
        assert response.data["amount"] == "250.00"

    def test_delete_own_bill(self, authenticated_client, user):
        bill = make_bill(user)
        response = authenticated_client.delete(f"/api/v1/bills/{bill.id}/")
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not RecurringBill.objects.filter(id=bill.id).exists()

    def test_cannot_access_other_users_bill(self, authenticated_client):
        other = UserFactory()
        bill = make_bill(other)
        response = authenticated_client.get(f"/api/v1/bills/{bill.id}/")
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestTransactionRecurringBillFK:
    def test_transaction_can_reference_recurring_bill(self, user):
        account = AccountFactory(user=user)
        category = CategoryFactory(user=user)
        bill = make_bill(user, category=category)
        t = TransactionFactory(
            user=user, account=account, category=category,
            is_recurring=True, recurring_bill=bill
        )
        t.refresh_from_db()
        assert t.recurring_bill == bill

    def test_deleting_bill_sets_transaction_fk_null(self, user):
        account = AccountFactory(user=user)
        category = CategoryFactory(user=user)
        bill = make_bill(user, category=category)
        t = TransactionFactory(
            user=user, account=account, category=category,
            is_recurring=True, recurring_bill=bill
        )
        bill.delete()
        t.refresh_from_db()
        assert t.recurring_bill is None
