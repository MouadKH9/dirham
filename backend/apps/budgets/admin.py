from django.contrib import admin
from .models import Budget, RecurringBudget


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ["user", "name", "categories_list", "amount", "month"]
    list_filter = ["month"]
    search_fields = ["user__email", "name", "categories__name_fr"]

    def categories_list(self, obj):
        return ", ".join(obj.categories.values_list("name_fr", flat=True))
    categories_list.short_description = "Categories"


@admin.register(RecurringBudget)
class RecurringBudgetAdmin(admin.ModelAdmin):
    list_display = ["user", "name", "categories_list", "amount", "start_month", "is_active"]
    list_filter = ["is_active", "start_month"]
    search_fields = ["user__email", "name", "categories__name_fr"]

    def categories_list(self, obj):
        return ", ".join(obj.categories.values_list("name_fr", flat=True))
    categories_list.short_description = "Categories"
