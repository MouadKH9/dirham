from rest_framework import serializers
from .models import Category


class CategorySerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "name_fr", "name_ar", "name_en", "icon", "is_system", "is_archived"]
        read_only_fields = ["id", "is_system"]

    def get_name(self, obj):
        request = self.context.get("request")
        if request:
            lang = getattr(request, "LANGUAGE_CODE", "fr")
            # Only support the three configured languages; fall back to fr
            if lang not in ("fr", "ar", "en"):
                lang = "fr"
            return getattr(obj, f"name_{lang}", obj.name_fr)
        return obj.name_fr


class CategoryCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name_fr", "name_ar", "name_en", "icon", "is_system", "is_archived"]
        read_only_fields = ["id", "is_system", "is_archived"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        validated_data["is_system"] = False
        return super().create(validated_data)
