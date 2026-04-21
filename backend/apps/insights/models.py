from django.db import models
from django.conf import settings
from apps.common.models import TimeStampedModel


class AIInsight(TimeStampedModel):
    class InsightType(models.TextChoices):
        BREAKDOWN = "breakdown", "Breakdown"
        ANOMALY = "anomaly", "Anomaly"
        AWARENESS = "awareness", "Awareness"

    class Severity(models.TextChoices):
        INFO = "info", "Info"
        WARNING = "warning", "Warning"
        CRITICAL = "critical", "Critical"

    class Language(models.TextChoices):
        FR = "fr", "French"
        AR = "ar", "Arabic"
        EN = "en", "English"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="insights",
    )
    type = models.CharField(max_length=20, choices=InsightType.choices)
    title = models.CharField(max_length=255)
    body = models.TextField()
    language = models.CharField(max_length=2, choices=Language.choices, default=Language.FR)
    period_start = models.DateField()
    period_end = models.DateField()
    severity = models.CharField(max_length=10, choices=Severity.choices, default=Severity.INFO)
    is_read = models.BooleanField(default=False)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = [("user", "period_start", "period_end", "type")]

    def __str__(self):
        return f"{self.title} ({self.user})"
