import pytest
from rest_framework import status
from apps.accounts.tests.factories import UserFactory
from .factories import CategoryFactory, SystemCategoryFactory


@pytest.mark.django_db
class TestCategoryListView:
    url = "/api/v1/categories/"

    def test_list_includes_system_categories(self, authenticated_client):
        SystemCategoryFactory(name_fr="Logement", name_en="Housing")
        response = authenticated_client.get(self.url)
        assert response.status_code == status.HTTP_200_OK
        names = [c["name_fr"] for c in response.data["results"]]
        assert "Logement" in names

    def test_list_includes_own_custom_categories(self, authenticated_client, user):
        CategoryFactory(user=user, name_fr="Ma Catégorie")
        response = authenticated_client.get(self.url)
        names = [c["name_fr"] for c in response.data["results"]]
        assert "Ma Catégorie" in names

    def test_list_excludes_other_users_categories(self, authenticated_client):
        other_user = UserFactory()
        CategoryFactory(user=other_user, name_fr="Autre")
        response = authenticated_client.get(self.url)
        names = [c["name_fr"] for c in response.data["results"]]
        assert "Autre" not in names

    def test_list_excludes_archived_categories(self, authenticated_client, user):
        CategoryFactory(user=user, name_fr="Archivée", is_archived=True)
        response = authenticated_client.get(self.url)
        names = [c["name_fr"] for c in response.data["results"]]
        assert "Archivée" not in names

    def test_accept_language_french(self, authenticated_client):
        SystemCategoryFactory(name_fr="Alimentation", name_ar="تغذية", name_en="Groceries")
        response = authenticated_client.get(self.url, HTTP_ACCEPT_LANGUAGE="fr")
        result = next(c for c in response.data["results"] if c["name_fr"] == "Alimentation")
        assert result["name"] == "Alimentation"

    def test_accept_language_arabic(self, authenticated_client):
        SystemCategoryFactory(name_fr="Alimentation", name_ar="تغذية", name_en="Groceries")
        response = authenticated_client.get(self.url, HTTP_ACCEPT_LANGUAGE="ar")
        result = next(c for c in response.data["results"] if c["name_fr"] == "Alimentation")
        assert result["name"] == "تغذية"

    def test_accept_language_english(self, authenticated_client):
        SystemCategoryFactory(name_fr="Alimentation", name_ar="تغذية", name_en="Groceries")
        response = authenticated_client.get(self.url, HTTP_ACCEPT_LANGUAGE="en")
        result = next(c for c in response.data["results"] if c["name_fr"] == "Alimentation")
        assert result["name"] == "Groceries"

    def test_unauthenticated_returns_401(self, api_client):
        response = api_client.get(self.url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestCategoryCreateView:
    url = "/api/v1/categories/"

    def test_create_custom_category(self, authenticated_client, user):
        data = {"name_fr": "Épargne", "name_ar": "توفير", "name_en": "Savings", "icon": "💰"}
        response = authenticated_client.post(self.url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["name_fr"] == "Épargne"
        assert not response.data["is_system"]

    def test_create_sets_user_from_request(self, authenticated_client, user):
        data = {"name_fr": "Épargne", "name_ar": "توفير", "name_en": "Savings", "icon": "💰"}
        authenticated_client.post(self.url, data)
        from apps.categories.models import Category
        cat = Category.objects.get(name_fr="Épargne")
        assert cat.user == user


@pytest.mark.django_db
class TestCategoryUpdateView:
    def test_patch_own_category(self, authenticated_client, user):
        cat = CategoryFactory(user=user, name_fr="Ancienne")
        response = authenticated_client.patch(f"/api/v1/categories/{cat.id}/", {"name_fr": "Nouvelle"})
        assert response.status_code == status.HTTP_200_OK
        assert response.data["name_fr"] == "Nouvelle"

    def test_patch_system_category_returns_403(self, authenticated_client):
        cat = SystemCategoryFactory()
        response = authenticated_client.patch(f"/api/v1/categories/{cat.id}/", {"name_fr": "Hack"})
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_patch_other_users_category_returns_404(self, authenticated_client):
        other_user = UserFactory()
        cat = CategoryFactory(user=other_user)
        response = authenticated_client.patch(f"/api/v1/categories/{cat.id}/", {"name_fr": "Hack"})
        # Other user's category is not in queryset — 404 is correct (don't leak existence)
        assert response.status_code == status.HTTP_404_NOT_FOUND
