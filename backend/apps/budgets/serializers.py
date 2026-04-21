from rest_framework import serializers
from .models import Budget, RecurringBudget
from apps.categories.models import Category


class BudgetSerializer(serializers.ModelSerializer):
    categories = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Category.objects.all(),
    )

    class Meta:
        model = Budget
        fields = [
            "id",
            "name",
            "categories",
            "amount",
            "month",
            "source_recurring_budget",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "source_recurring_budget", "created_at", "updated_at"]

    def validate_name(self, name):
        if name is None:
            return ""
        return name.strip()

    def validate_categories(self, categories):
        request = self.context.get("request")
        if not request:
            return categories
        if not categories:
            raise serializers.ValidationError("At least one category is required.")
        invalid = [category.id for category in categories if category.user_id != request.user.id and not category.is_system]
        if invalid:
            raise serializers.ValidationError("One or more categories are invalid.")
        return categories

    def create(self, validated_data):
        categories = validated_data.pop("categories", [])
        budget = Budget.objects.create(**validated_data)
        budget.categories.set(categories)
        return budget

    def update(self, instance, validated_data):
        categories = validated_data.pop("categories", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if categories is not None:
            instance.categories.set(categories)
        return instance


class RecurringBudgetSerializer(serializers.ModelSerializer):
    categories = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Category.objects.all(),
    )

    class Meta:
        model = RecurringBudget
        fields = ["id", "name", "categories", "amount", "start_month", "is_active", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_name(self, name):
        if name is None:
            return ""
        return name.strip()

    def validate_categories(self, categories):
        request = self.context.get("request")
        if not request:
            return categories
        if not categories:
            raise serializers.ValidationError("At least one category is required.")
        invalid = [category.id for category in categories if category.user_id != request.user.id and not category.is_system]
        if invalid:
            raise serializers.ValidationError("One or more categories are invalid.")
        return categories

    def create(self, validated_data):
        categories = validated_data.pop("categories", [])
        recurring_budget = RecurringBudget.objects.create(**validated_data)
        recurring_budget.categories.set(categories)
        return recurring_budget

    def update(self, instance, validated_data):
        categories = validated_data.pop("categories", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if categories is not None:
            instance.categories.set(categories)
        return instance
