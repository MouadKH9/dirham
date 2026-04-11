import pytest
from apps.categories.models import Category
from .factories import CategoryFactory, SystemCategoryFactory


@pytest.mark.django_db
class TestCategoryModel:
    def test_create_custom_category(self):
        cat = CategoryFactory()
        assert cat.id is not None
        assert cat.user is not None
        assert not cat.is_system
        assert not cat.is_archived

    def test_create_system_category(self):
        cat = SystemCategoryFactory()
        assert cat.user is None
        assert cat.is_system

    def test_str_returns_french_name(self):
        cat = CategoryFactory(name_fr="Alimentation")
        assert str(cat) == "Alimentation"

    def test_uuid_pk(self):
        import uuid
        cat = CategoryFactory()
        assert isinstance(cat.id, uuid.UUID)
