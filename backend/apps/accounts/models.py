import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.conf import settings
from apps.common.models import TimeStampedModel
from .managers import CustomUserManager


class User(AbstractBaseUser, PermissionsMixin):
    class Language(models.TextChoices):
        FRENCH = "fr", "French"
        ARABIC = "ar", "Arabic"
        ENGLISH = "en", "English"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    preferred_language = models.CharField(
        max_length=2, choices=Language.choices, default=Language.FRENCH
    )
    preferred_currency = models.CharField(max_length=3, default="MAD")
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email


class Account(TimeStampedModel):
    class AccountType(models.TextChoices):
        MANUAL = "manual", "Manual"
        SYNCED = "synced", "Synced"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="accounts",
    )
    name = models.CharField(max_length=100)
    type = models.CharField(
        max_length=10,
        choices=AccountType.choices,
        default=AccountType.MANUAL,
    )
    currency = models.CharField(max_length=3, default="MAD")
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    last_synced_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.currency})"
