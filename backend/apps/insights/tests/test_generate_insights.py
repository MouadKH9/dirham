import pytest
from datetime import date
from unittest.mock import patch, MagicMock
from django.core.management import call_command
from apps.accounts.tests.factories import UserFactory
from apps.transactions.models import Transaction
from apps.accounts.models import Account
from apps.categories.models import Category
from apps.insights.models import AIInsight


def make_transactions(user, n=5):
    account = Account.objects.filter(user=user).first()
    category = Category.objects.filter(is_system=True).first()
    if not category:
        category = Category.objects.create(
            name_fr="Test",
            name_ar="اختبار",
            name_en="Test",
            icon="🧪",
            is_system=True,
        )
    for i in range(n):
        Transaction.objects.create(
            user=user,
            account=account,
            category=category,
            type=Transaction.TransactionType.EXPENSE,
            amount="100.00",
            currency="MAD",
            date=date(2026, 4, i + 1),
        )


MOCK_CLAUDE_RESPONSE = MagicMock()
MOCK_CLAUDE_RESPONSE.content = [
    MagicMock(
        text='{"type": "awareness", "title": "Test Insight", "body": "You spent more this month.", "severity": "info"}'
    )
]


@pytest.mark.django_db
class TestGenerateInsightsCommand:
    def test_creates_insight_for_user_with_transactions(self):
        user = UserFactory()
        make_transactions(user)

        with patch("anthropic.Anthropic") as MockAnthropic:
            mock_client = MagicMock()
            MockAnthropic.return_value = mock_client
            mock_client.messages.create.return_value = MOCK_CLAUDE_RESPONSE

            call_command("generate_insights", "--period=2026-04")

        assert AIInsight.objects.filter(user=user).count() == 1
        insight = AIInsight.objects.get(user=user)
        assert insight.type == "awareness"
        assert insight.title == "Test Insight"
        assert insight.period_start == date(2026, 4, 1)
        assert insight.period_end == date(2026, 4, 30)

    def test_skips_users_with_no_transactions(self):
        user = UserFactory()  # no transactions

        with patch("anthropic.Anthropic") as MockAnthropic:
            mock_client = MagicMock()
            MockAnthropic.return_value = mock_client
            mock_client.messages.create.return_value = MOCK_CLAUDE_RESPONSE

            call_command("generate_insights", "--period=2026-04")

        assert AIInsight.objects.filter(user=user).count() == 0

    def test_uses_user_preferred_language(self):
        user = UserFactory(preferred_language="ar")
        make_transactions(user)

        with patch("anthropic.Anthropic") as MockAnthropic:
            mock_client = MagicMock()
            MockAnthropic.return_value = mock_client
            mock_client.messages.create.return_value = MOCK_CLAUDE_RESPONSE

            call_command("generate_insights", "--period=2026-04")

        insight = AIInsight.objects.get(user=user)
        assert insight.language == "ar"

    def test_insight_language_defaults_to_fr(self):
        user = UserFactory(preferred_language="fr")
        make_transactions(user)

        with patch("anthropic.Anthropic") as MockAnthropic:
            mock_client = MagicMock()
            MockAnthropic.return_value = mock_client
            mock_client.messages.create.return_value = MOCK_CLAUDE_RESPONSE

            call_command("generate_insights", "--period=2026-04")

        insight = AIInsight.objects.get(user=user)
        assert insight.language == "fr"

    def test_default_period_is_previous_month(self):
        user = UserFactory()
        make_transactions(user)

        # Freeze time so test is deterministic
        with patch("apps.insights.management.commands.generate_insights.date") as mock_date:
            mock_date.today.return_value = date(2026, 5, 10)
            mock_date.side_effect = lambda *args, **kw: date(*args, **kw)

            with patch("anthropic.Anthropic") as MockAnthropic:
                mock_client = MagicMock()
                MockAnthropic.return_value = mock_client
                mock_client.messages.create.return_value = MOCK_CLAUDE_RESPONSE

                call_command("generate_insights")

        insight = AIInsight.objects.get(user=user)
        assert insight.period_start == date(2026, 4, 1)
        assert insight.period_end == date(2026, 4, 30)
