from unittest.mock import patch

import pytest
from django.urls import reverse
from rest_framework import status
from apps.accounts.models import User, Account
from .factories import UserFactory, AccountFactory


@pytest.mark.django_db
class TestRegisterView:
    url = "/api/v1/auth/register/"

    def test_register_success(self, api_client):
        data = {"email": "new@example.com", "password": "securepass123"}
        response = api_client.post(self.url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert "tokens" in response.data
        assert "access" in response.data["tokens"]
        assert "refresh" in response.data["tokens"]
        assert response.data["user"]["email"] == "new@example.com"

    def test_register_creates_user(self, api_client):
        api_client.post(self.url, {"email": "created@example.com", "password": "securepass123"})
        assert User.objects.filter(email="created@example.com").exists()

    def test_register_auto_creates_cash_account(self, api_client):
        api_client.post(self.url, {"email": "cash@example.com", "password": "securepass123"})
        user = User.objects.get(email="cash@example.com")
        assert Account.objects.filter(user=user, name="Cash").exists()

    def test_register_duplicate_email_returns_400(self, api_client):
        UserFactory(email="dup@example.com")
        response = api_client.post(self.url, {"email": "dup@example.com", "password": "securepass123"})
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_short_password_returns_400(self, api_client):
        response = api_client.post(self.url, {"email": "short@example.com", "password": "abc"})
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_missing_email_returns_400(self, api_client):
        response = api_client.post(self.url, {"password": "securepass123"})
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_emits_privacy_safe_signup_event(self, api_client):
        with patch("apps.accounts.views.analytics.capture") as capture:
            response = api_client.post(
                self.url,
                {
                    "email": "analytics@example.com",
                    "password": "securepass123",
                },
            )

        assert response.status_code == status.HTTP_201_CREATED
        capture.assert_called_once()
        args, kwargs = capture.call_args
        user_arg, event_name, properties = args
        user = User.objects.get(email="analytics@example.com")

        assert user_arg.id == user.id
        assert event_name == "signup_completed"
        assert properties == {"preferred_language": "fr", "source": "backend"}
        assert "email" not in properties
        assert "password" not in properties


@pytest.mark.django_db
class TestLoginView:
    url = "/api/v1/auth/login/"

    def test_login_success(self, api_client):
        UserFactory(email="login@example.com")
        response = api_client.post(self.url, {"email": "login@example.com", "password": "testpass123"})
        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data
        assert "refresh" in response.data
        assert "user" in response.data

    def test_login_wrong_password_returns_401(self, api_client):
        UserFactory(email="wrong@example.com")
        response = api_client.post(self.url, {"email": "wrong@example.com", "password": "badpass"})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_nonexistent_user_returns_401(self, api_client):
        response = api_client.post(self.url, {"email": "ghost@example.com", "password": "pass1234"})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestTokenRefreshView:
    login_url = "/api/v1/auth/login/"
    refresh_url = "/api/v1/auth/refresh/"

    def test_refresh_with_valid_token(self, api_client):
        UserFactory(email="refresh@example.com")
        login_resp = api_client.post(self.login_url, {"email": "refresh@example.com", "password": "testpass123"})
        refresh_token = login_resp.data["refresh"]
        response = api_client.post(self.refresh_url, {"refresh": refresh_token})
        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data


@pytest.mark.django_db
class TestLogoutView:
    login_url = "/api/v1/auth/login/"
    logout_url = "/api/v1/auth/logout/"
    refresh_url = "/api/v1/auth/refresh/"

    def test_logout_blacklists_refresh_token(self, api_client):
        UserFactory(email="logout@example.com")
        login_resp = api_client.post(self.login_url, {"email": "logout@example.com", "password": "testpass123"})
        refresh_token = login_resp.data["refresh"]
        access_token = login_resp.data["access"]

        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        logout_resp = api_client.post(self.logout_url, {"refresh": refresh_token})
        assert logout_resp.status_code == status.HTTP_205_RESET_CONTENT

        # Blacklisted refresh should now fail
        refresh_resp = api_client.post(self.refresh_url, {"refresh": refresh_token})
        assert refresh_resp.status_code == status.HTTP_401_UNAUTHORIZED

    def test_logout_requires_authentication(self, api_client):
        response = api_client.post(self.logout_url, {"refresh": "sometoken"})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestMeViewDelete:
    """App Store Review Guideline 5.1.1(v) — in-app account deletion."""

    url = "/api/v1/auth/me/"

    def test_delete_requires_authentication(self, api_client):
        response = api_client.delete(self.url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_delete_returns_204(self, authenticated_client):
        response = authenticated_client.delete(self.url)
        assert response.status_code == status.HTTP_204_NO_CONTENT

    def test_delete_removes_user(self, authenticated_client, user):
        user_id = user.id
        authenticated_client.delete(self.url)
        assert not User.objects.filter(id=user_id).exists()

    def test_delete_cascades_to_accounts(self, authenticated_client, user):
        user_id = user.id
        assert Account.objects.filter(user_id=user_id).exists()
        authenticated_client.delete(self.url)
        assert not Account.objects.filter(user_id=user_id).exists()

    def test_deleted_user_cannot_access_protected_endpoints(self, api_client):
        UserFactory(email="todelete@example.com")
        login_resp = api_client.post(
            "/api/v1/auth/login/",
            {"email": "todelete@example.com", "password": "testpass123"},
        )
        access_token = login_resp.data["access"]

        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        delete_resp = api_client.delete(self.url)
        assert delete_resp.status_code == status.HTTP_204_NO_CONTENT

        # Any further request with the same access token must fail because the
        # user row no longer exists in the database.
        followup = api_client.get("/api/v1/accounts/")
        assert followup.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestAccountListCreateView:
    url = "/api/v1/accounts/"

    def test_list_returns_only_own_accounts(self, authenticated_client, user):
        other_user = UserFactory()
        AccountFactory(user=other_user, name="Other Account")
        response = authenticated_client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        # user already has the default Cash account from signal
        names = [a["name"] for a in response.data["results"]]
        assert "Other Account" not in names
        assert "Cash" in names

    def test_create_account(self, authenticated_client, user):
        data = {"name": "CIH", "type": "manual", "currency": "MAD", "balance": "5000.00"}
        response = authenticated_client.post(self.url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["name"] == "CIH"

    def test_unauthenticated_returns_401(self, api_client):
        response = api_client.get(self.url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestAccountDetailView:
    def test_retrieve_own_account(self, authenticated_client, user):
        account = Account.objects.get(user=user, name="Cash")
        response = authenticated_client.get(f"/api/v1/accounts/{account.id}/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["name"] == "Cash"

    def test_cannot_retrieve_other_users_account(self, authenticated_client):
        other_user = UserFactory()
        other_account = Account.objects.get(user=other_user, name="Cash")
        response = authenticated_client.get(f"/api/v1/accounts/{other_account.id}/")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_patch_own_account(self, authenticated_client, user):
        account = Account.objects.get(user=user, name="Cash")
        response = authenticated_client.patch(f"/api/v1/accounts/{account.id}/", {"name": "Petite Caisse"})
        assert response.status_code == status.HTTP_200_OK
        assert response.data["name"] == "Petite Caisse"
