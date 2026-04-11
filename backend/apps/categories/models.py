from django.db import models
from django.conf import settings
from apps.common.models import TimeStampedModel


class Category(TimeStampedModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="categories",
    )
    name_fr = models.CharField(max_length=100)
    name_ar = models.CharField(max_length=100)
    name_en = models.CharField(max_length=100)
    icon = models.CharField(max_length=10)
    is_system = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)

    class Meta:
        verbose_name_plural = "categories"
        ordering = ["name_fr"]

    def __str__(self):
        return self.name_fr
