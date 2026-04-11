from rest_framework import serializers
from .models import Transaction, RecurringBill


class RecurringBillSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecurringBill
        fields = [
            "id", "category", "name", "amount", "frequency",
            "next_due_date", "is_active", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = [
            "id", "account", "category", "type", "amount", "currency",
            "date", "notes", "is_recurring", "recurring_bill",
            "external_id", "source", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
