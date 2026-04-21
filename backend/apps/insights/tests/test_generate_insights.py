import pytest
from decimal import Decimal
from datetime import date
from unittest.mock import patch, MagicMock, call
from django.core.management import call_command
from apps.accounts.tests.factories import UserFactory
from apps.transactions.models import Transaction
from apps.accounts.models import Account
from apps.categories.models import Category
from apps.insights.models import AIInsight


def make_transactions(user, n=5, lang_category=None):
    account = Account.objects.filter(user=user).first()
    category = Category.objects.filter(is_system=True).first()
    if not category:
        category = Category.objects.create(
            name_fr="Alimentation",
            name_ar="طعام",
            name_en="Food",
            icon="🍔",
            is_system=True,
        )
    for i in range(n):
        Transaction.objects.create(
            user=user,
            account=account,
            category=category,
            type=Transaction.TransactionType.EXPENSE,
            amount=Decimal("100.00"),
            currency="MAD",
            date=date(2026, 4, i + 1),
        )


def _mock_claude(items):
    """Return a mock Anthropic response that yields a JSON array of insight dicts."""
    mock_response = MagicMock()
    mock_response.content = [MagicMock(text=__import__("json").dumps(items))]
    return mock_response


SINGLE_INSIGHT = [
    {"type": "awareness", "title": "Test Insight", "body": "You spent more this month.", "severity": "info"}
]

MULTI_INSIGHT = [
    {"type": "breakdown", "title": "Spending Breakdown", "body": "Most spending was on food.", "severity": "info"},
    {"type": "anomaly", "title": "Unusual Spike", "body": "You spent 3x more than usual on transport.", "severity": "warning"},
    {"type": "awareness", "title": "Good Habit", "body": "You reduced café spending this month.", "severity": "info"},
]


@pytest.mark.django_db
class TestGenerateInsightsCommand:
    def test_creates_insights_for_user_with_transactions(self):
        user = UserFactory()
        make_transactions(user)

        with patch("anthropic.Anthropic") as MockAnthropic:
            mock_client = MagicMock()
            MockAnthropic.return_value = mock_client
            mock_client.messages.create.return_value = _mock_claude(MULTI_INSIGHT)

            call_command("generate_insights", "--period=2026-04")

        assert AIInsight.objects.filter(user=user).count() == 3
        types = set(AIInsight.objects.filter(user=user).values_list("type", flat=True))
        assert types == {"breakdown", "anomaly", "awareness"}

    def test_single_insight_response_also_accepted(self):
        """Claude returning a single-item array (or object) should still work."""
        user = UserFactory()
        make_transactions(user)

        with patch("anthropic.Anthropic") as MockAnthropic:
            mock_client = MagicMock()
            MockAnthropic.return_value = mock_client
            mock_client.messages.create.return_value = _mock_claude(SINGLE_INSIGHT)

            call_command("generate_insights", "--period=2026-04")

        assert AIInsight.objects.filter(user=user).count() == 1
        insight = AIInsight.objects.get(user=user)
        assert insight.type == "awareness"
        assert insight.period_start == date(2026, 4, 1)
        assert insight.period_end == date(2026, 4, 30)

    def test_skips_users_with_no_transactions(self):
        user = UserFactory()

        with patch("anthropic.Anthropic") as MockAnthropic:
            mock_client = MagicMock()
            MockAnthropic.return_value = mock_client
            mock_client.messages.create.return_value = _mock_claude(SINGLE_INSIGHT)

            call_command("generate_insights", "--period=2026-04")

        assert AIInsight.objects.filter(user=user).count() == 0

    def test_uses_user_preferred_language(self):
        user = UserFactory(preferred_language="ar")
        make_transactions(user)

        with patch("anthropic.Anthropic") as MockAnthropic:
            mock_client = MagicMock()
            MockAnthropic.return_value = mock_client
            mock_client.messages.create.return_value = _mock_claude(SINGLE_INSIGHT)

            call_command("generate_insights", "--period=2026-04")

        insight = AIInsight.objects.get(user=user)
        assert insight.language == "ar"

    def test_insight_language_defaults_to_fr(self):
        user = UserFactory(preferred_language="fr")
        make_transactions(user)

        with patch("anthropic.Anthropic") as MockAnthropic:
            mock_client = MagicMock()
            MockAnthropic.return_value = mock_client
            mock_client.messages.create.return_value = _mock_claude(SINGLE_INSIGHT)

            call_command("generate_insights", "--period=2026-04")

        insight = AIInsight.objects.get(user=user)
        assert insight.language == "fr"

    def test_prompt_uses_arabic_category_names_for_arabic_user(self):
        user = UserFactory(preferred_language="ar")
        make_transactions(user)

        with patch("anthropic.Anthropic") as MockAnthropic:
            mock_client = MagicMock()
            MockAnthropic.return_value = mock_client
            mock_client.messages.create.return_value = _mock_claude(SINGLE_INSIGHT)

            call_command("generate_insights", "--period=2026-04")

        prompt_text = mock_client.messages.create.call_args[1]["messages"][0]["content"]
        assert "طعام" in prompt_text
        assert "Alimentation" not in prompt_text

    def test_prompt_uses_french_category_names_for_french_user(self):
        user = UserFactory(preferred_language="fr")
        make_transactions(user)

        with patch("anthropic.Anthropic") as MockAnthropic:
            mock_client = MagicMock()
            MockAnthropic.return_value = mock_client
            mock_client.messages.create.return_value = _mock_claude(SINGLE_INSIGHT)

            call_command("generate_insights", "--period=2026-04")

        prompt_text = mock_client.messages.create.call_args[1]["messages"][0]["content"]
        assert "Alimentation" in prompt_text

    def test_metadata_populated_on_insight(self):
        user = UserFactory()
        make_transactions(user, n=5)

        with patch("anthropic.Anthropic") as MockAnthropic:
            mock_client = MagicMock()
            MockAnthropic.return_value = mock_client
            mock_client.messages.create.return_value = _mock_claude(SINGLE_INSIGHT)

            call_command("generate_insights", "--period=2026-04")

        insight = AIInsight.objects.get(user=user)
        assert insight.metadata["total_transactions"] == 5
        assert insight.metadata["total_spent_mad"] == 500.0
        assert "top_categories" in insight.metadata
        assert "totals_by_type" in insight.metadata

    def test_default_period_is_previous_month(self):
        user = UserFactory()
        make_transactions(user)

        with patch("apps.insights.management.commands.generate_insights.date") as mock_date:
            mock_date.today.return_value = date(2026, 5, 10)
            mock_date.side_effect = lambda *args, **kw: date(*args, **kw)

            with patch("anthropic.Anthropic") as MockAnthropic:
                mock_client = MagicMock()
                MockAnthropic.return_value = mock_client
                mock_client.messages.create.return_value = _mock_claude(SINGLE_INSIGHT)

                call_command("generate_insights")

        insight = AIInsight.objects.get(user=user)
        assert insight.period_start == date(2026, 4, 1)
        assert insight.period_end == date(2026, 4, 30)

    def test_skips_existing_insights_without_overwrite(self):
        user = UserFactory()
        make_transactions(user)

        with patch("anthropic.Anthropic") as MockAnthropic:
            mock_client = MagicMock()
            MockAnthropic.return_value = mock_client
            mock_client.messages.create.return_value = _mock_claude(SINGLE_INSIGHT)

            call_command("generate_insights", "--period=2026-04")
            first_count = AIInsight.objects.filter(user=user).count()

            call_command("generate_insights", "--period=2026-04")
            second_count = AIInsight.objects.filter(user=user).count()

        assert first_count == second_count
        assert mock_client.messages.create.call_count == 1

    def test_overwrite_replaces_existing_insights(self):
        user = UserFactory()
        make_transactions(user)

        with patch("anthropic.Anthropic") as MockAnthropic:
            mock_client = MagicMock()
            MockAnthropic.return_value = mock_client
            mock_client.messages.create.return_value = _mock_claude(SINGLE_INSIGHT)

            call_command("generate_insights", "--period=2026-04")
            first_ids = set(AIInsight.objects.filter(user=user).values_list("id", flat=True))

            mock_client.messages.create.return_value = _mock_claude(MULTI_INSIGHT)
            call_command("generate_insights", "--period=2026-04", "--overwrite")
            second_ids = set(AIInsight.objects.filter(user=user).values_list("id", flat=True))

        assert first_ids.isdisjoint(second_ids)
        assert AIInsight.objects.filter(user=user).count() == 3
