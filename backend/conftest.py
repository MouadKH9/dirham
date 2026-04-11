import pytest
from rest_framework.test import APIClient


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(db):
    from apps.accounts.tests.factories import UserFactory
    return UserFactory()


@pytest.fixture
def authenticated_client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client
