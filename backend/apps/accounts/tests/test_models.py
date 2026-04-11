import pytest
from apps.accounts.models import User


@pytest.mark.django_db
class TestCustomUserManager:
    def test_create_user(self):
        user = User.objects.create_user(email="test@example.com", password="pass1234")
        assert user.email == "test@example.com"
        assert user.check_password("pass1234")
        assert user.is_active
        assert not user.is_staff
        assert not user.is_superuser

    def test_create_user_normalizes_email(self):
        user = User.objects.create_user(email="Test@EXAMPLE.COM", password="pass1234")
        assert user.email == "test@example.com"

    def test_create_user_without_email_raises(self):
        with pytest.raises(ValueError, match="Email is required"):
            User.objects.create_user(email="", password="pass1234")

    def test_create_superuser(self):
        user = User.objects.create_superuser(email="admin@example.com", password="pass1234")
        assert user.is_staff
        assert user.is_superuser

    def test_user_uuid_pk(self):
        user = User.objects.create_user(email="uuid@example.com", password="pass1234")
        import uuid
        assert isinstance(user.id, uuid.UUID)

    def test_user_str(self):
        user = User.objects.create_user(email="str@example.com", password="pass1234")
        assert str(user) == "str@example.com"

    def test_default_language_is_french(self):
        user = User.objects.create_user(email="fr@example.com", password="pass1234")
        assert user.preferred_language == "fr"

    def test_default_currency_is_mad(self):
        user = User.objects.create_user(email="mad@example.com", password="pass1234")
        assert user.preferred_currency == "MAD"
