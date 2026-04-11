from django.contrib import admin
from .models import Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name_fr", "name_ar", "name_en", "icon", "is_system", "is_archived", "user"]
    list_filter = ["is_system", "is_archived"]
    search_fields = ["name_fr", "name_ar", "name_en"]
