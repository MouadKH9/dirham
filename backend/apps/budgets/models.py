from django.db import models
from django.conf import settings
from apps.common.models import TimeStampedModel


class Budget(TimeStampedModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="budgets",
    )
    categories = models.ManyToManyField(
        "categories.Category",
        related_name="budgets",
    )
    source_recurring_budget = models.ForeignKey(
        "budgets.RecurringBudget",
        on_delete=models.SET_NULL,
        related_name="generated_budgets",
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=120, blank=True, default="")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    month = models.DateField()  # always first day of month

    class Meta:
        ordering = ["-month", "-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "source_recurring_budget", "month"],
                condition=models.Q(source_recurring_budget__isnull=False),
                name="unique_generated_budget_per_template_month",
            ),
        ]

    def __str__(self):
        display_name = self.name.strip() if self.name else "Budget"
        return f"{display_name} {self.month.strftime('%Y-%m')} — {self.amount} MAD"


class RecurringBudget(TimeStampedModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="recurring_budgets",
    )
    categories = models.ManyToManyField(
        "categories.Category",
        related_name="recurring_budgets",
    )
    name = models.CharField(max_length=120, blank=True, default="")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    start_month = models.DateField()  # always first day of month
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "name", "start_month"],
                condition=~models.Q(name=""),
                name="unique_recurring_budget_name_start_month",
            ),
        ]

    def __str__(self):
        display_name = self.name.strip() if self.name else "Recurring budget"
        return f"{display_name} from {self.start_month.strftime('%Y-%m')}"
