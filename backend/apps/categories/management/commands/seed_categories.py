from django.core.management.base import BaseCommand
from apps.categories.models import Category

SYSTEM_CATEGORIES = [
    {"name_fr": "Logement",         "name_ar": "سكن",            "name_en": "Housing",           "icon": "🏠"},
    {"name_fr": "Alimentation",     "name_ar": "تغذية",          "name_en": "Groceries",         "icon": "🛒"},
    {"name_fr": "Restaurants & Cafés", "name_ar": "مطاعم ومقاهي", "name_en": "Restaurants & Cafés", "icon": "☕"},
    {"name_fr": "Transport",        "name_ar": "نقل",            "name_en": "Transport",         "icon": "🚕"},
    {"name_fr": "Abonnements",      "name_ar": "اشتراكات",       "name_en": "Subscriptions",     "icon": "📱"},
    {"name_fr": "Santé",            "name_ar": "صحة",            "name_en": "Health",            "icon": "🏥"},
    {"name_fr": "Shopping",         "name_ar": "تسوق",           "name_en": "Shopping",          "icon": "🛍️"},
    {"name_fr": "Loisirs",          "name_ar": "ترفيه",          "name_en": "Entertainment",     "icon": "🎬"},
    {"name_fr": "Factures",         "name_ar": "فواتير",         "name_en": "Bills & Utilities", "icon": "💡"},
    {"name_fr": "Éducation",        "name_ar": "تعليم",          "name_en": "Education",         "icon": "📚"},
    {"name_fr": "Dépenses Pro",     "name_ar": "مصاريف مهنية",   "name_en": "Business Expenses", "icon": "💼"},
    {"name_fr": "Soins Personnels", "name_ar": "عناية شخصية",    "name_en": "Personal Care",     "icon": "💆"},
    {"name_fr": "Cadeaux",          "name_ar": "هدايا",          "name_en": "Gifts",             "icon": "🎁"},
    {"name_fr": "Autre",            "name_ar": "أخرى",           "name_en": "Other",             "icon": "📌"},
]


class Command(BaseCommand):
    help = "Seed the 14 predefined system categories (idempotent)"

    def handle(self, *args, **options):
        created_count = 0
        for cat_data in SYSTEM_CATEGORIES:
            _, created = Category.objects.update_or_create(
                name_en=cat_data["name_en"],
                is_system=True,
                defaults={**cat_data, "user": None, "is_system": True},
            )
            if created:
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {created_count} new categories "
                f"({len(SYSTEM_CATEGORIES)} total system categories)"
            )
        )
