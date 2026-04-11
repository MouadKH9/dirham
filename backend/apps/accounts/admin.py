from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Account


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["email", "preferred_language", "preferred_currency", "is_staff", "created_at"]
    list_filter = ["is_staff", "is_active", "preferred_language"]
    search_fields = ["email"]
    ordering = ["-created_at"]
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Preferences", {"fields": ("preferred_language", "preferred_currency")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "password1", "password2"),
        }),
    )
    filter_horizontal = ["groups", "user_permissions"]


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ["name", "user", "type", "currency", "balance", "created_at"]
    list_filter = ["type", "currency"]
    search_fields = ["name", "user__email"]
