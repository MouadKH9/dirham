from django.db import models
from django.conf import settings
from apps.common.models import TimeStampedModel


class RecurringBill(TimeStampedModel):
    class Frequency(models.TextChoices):
        WEEKLY = "weekly", "Weekly"
        MONTHLY = "monthly", "Monthly"
        YEARLY = "yearly", "Yearly"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="recurring_bills",
    )
    category = models.ForeignKey(
        "categories.Category",
        on_delete=models.PROTECT,
        related_name="recurring_bills",
    )
    name = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    frequency = models.CharField(max_length=10, choices=Frequency.choices)
    next_due_date = models.DateField()
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["next_due_date"]

    def __str__(self):
        return f"{self.name} ({self.frequency})"


class Transaction(TimeStampedModel):
    class TransactionType(models.TextChoices):
        INCOME = "income", "Income"
        EXPENSE = "expense", "Expense"
        BILL = "bill", "Bill"

    class Source(models.TextChoices):
        MANUAL = "manual", "Manual"
        AUTO_SYNC = "auto_sync", "Auto Sync"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="transactions",
    )
    account = models.ForeignKey(
        "accounts.Account",
        on_delete=models.CASCADE,
        related_name="transactions",
    )
    category = models.ForeignKey(
        "categories.Category",
        on_delete=models.PROTECT,
        related_name="transactions",
    )
    type = models.CharField(max_length=10, choices=TransactionType.choices)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="MAD")
    date = models.DateField()
    notes = models.TextField(blank=True, null=True)
    is_recurring = models.BooleanField(default=False)
    recurring_bill = models.ForeignKey(
        "transactions.RecurringBill",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="transactions",
    )
    external_id = models.CharField(max_length=255, null=True, blank=True)
    source = models.CharField(
        max_length=10, choices=Source.choices, default=Source.MANUAL
    )

    class Meta:
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"{self.type} {self.amount} {self.currency} on {self.date}"
