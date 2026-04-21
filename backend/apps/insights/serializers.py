from rest_framework import serializers
from .models import AIInsight


class AIInsightSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIInsight
        fields = [
            "id",
            "type",
            "title",
            "body",
            "language",
            "period_start",
            "period_end",
            "severity",
            "is_read",
            "metadata",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "type",
            "title",
            "body",
            "language",
            "period_start",
            "period_end",
            "severity",
            "metadata",
            "created_at",
        ]
