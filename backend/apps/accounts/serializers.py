from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Account


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "preferred_language", "preferred_currency", "created_at"]
        read_only_fields = ["id", "created_at"]


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    preferred_language = serializers.ChoiceField(
        choices=User.Language.choices, default="fr", required=False
    )

    def validate_email(self, value):
        normalized = value.lower()
        if User.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return normalized

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = [
            "id", "name", "type", "currency", "balance",
            "last_synced_at", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
