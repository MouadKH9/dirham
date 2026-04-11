from django.db import models
from django.conf import settings
from apps.common.models import TimeStampedModel


class Budget(TimeStampedModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="budgets",
    )
    category = models.ForeignKey(
        "categories.Category",
        on_delete=models.PROTECT,
        related_name="budgets",
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    month = models.DateField()  # always first day of month

    class Meta:
        ordering = ["-month", "category__name_fr"]
        unique_together = [("user", "category", "month")]

    def __str__(self):
        return f"{self.category.name_fr} {self.month.strftime('%Y-%m')} — {self.amount} MAD"
