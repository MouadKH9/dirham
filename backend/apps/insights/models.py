import uuid
from django.db import models
from django.conf import settings


class AIInsight(models.Model):
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

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
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
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-generated_at"]

    def __str__(self):
        return f"{self.title} ({self.user})"
