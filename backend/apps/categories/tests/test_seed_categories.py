import pytest
from django.core.management import call_command
from apps.categories.models import Category


@pytest.mark.django_db
class TestSeedCategoriesCommand:
    def test_creates_14_system_categories(self):
        call_command("seed_categories", verbosity=0)
        assert Category.objects.filter(is_system=True, user__isnull=True).count() == 14

    def test_idempotent_on_second_run(self):
        call_command("seed_categories", verbosity=0)
        call_command("seed_categories", verbosity=0)
        assert Category.objects.filter(is_system=True, user__isnull=True).count() == 14

    def test_categories_have_all_three_names(self):
        call_command("seed_categories", verbosity=0)
        for cat in Category.objects.filter(is_system=True):
            assert cat.name_fr
            assert cat.name_ar
            assert cat.name_en

    def test_categories_have_icons(self):
        call_command("seed_categories", verbosity=0)
        for cat in Category.objects.filter(is_system=True):
            assert cat.icon
