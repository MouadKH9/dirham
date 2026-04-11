import factory
from apps.accounts.tests.factories import UserFactory
from apps.categories.models import Category


class CategoryFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Category

    user = factory.SubFactory(UserFactory)
    name_fr = factory.Sequence(lambda n: f"Catégorie {n}")
    name_ar = factory.Sequence(lambda n: f"فئة {n}")
    name_en = factory.Sequence(lambda n: f"Category {n}")
    icon = "📌"
    is_system = False
    is_archived = False


class SystemCategoryFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Category

    user = None
    name_fr = factory.Sequence(lambda n: f"Système {n}")
    name_ar = factory.Sequence(lambda n: f"نظام {n}")
    name_en = factory.Sequence(lambda n: f"System {n}")
    icon = "⚙️"
    is_system = True
    is_archived = False
