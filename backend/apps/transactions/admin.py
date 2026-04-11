from django.contrib import admin
from .models import Transaction, RecurringBill


@admin.register(RecurringBill)
class RecurringBillAdmin(admin.ModelAdmin):
    list_display = ["name", "user", "frequency", "amount", "next_due_date", "is_active"]
    list_filter = ["frequency", "is_active"]
    search_fields = ["name", "user__email"]


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ["user", "type", "amount", "currency", "category", "date", "source"]
    list_filter = ["type", "source", "currency"]
    search_fields = ["notes", "user__email"]
    date_hierarchy = "date"
