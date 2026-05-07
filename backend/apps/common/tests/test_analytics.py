"""Tests for the privacy-first PostHog analytics wrapper."""

from __future__ import annotations

import uuid
from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest

from apps.common import analytics


@pytest.fixture(autouse=True)
def _reset_state():
    """Make sure module-level state can't leak between tests."""
    analytics.reset_for_tests()
    yield
    analytics.reset_for_tests()


def _force_enabled_client():
    """Bypass settings and inject a mock PostHog client for assertions."""
    mock_client = MagicMock()
    analytics._initialized = True
    analytics._client = mock_client
    return mock_client


class TestInitAnalytics:
    def test_disabled_when_flag_false(self, settings):
        settings.POSTHOG_ENABLED = False
        settings.POSTHOG_API_KEY = "phc_test_key"

        analytics.init_analytics()

        assert analytics.is_enabled() is False

    def test_disabled_when_api_key_missing(self, settings):
        settings.POSTHOG_ENABLED = True
        settings.POSTHOG_API_KEY = ""

        analytics.init_analytics()

        assert analytics.is_enabled() is False

    def test_enabled_with_flag_and_key(self, settings):
        settings.POSTHOG_ENABLED = True
        settings.POSTHOG_API_KEY = "phc_test_key"
        settings.POSTHOG_HOST = "https://eu.i.posthog.com"

        analytics.init_analytics()

        assert analytics.is_enabled() is True
        assert analytics._client.api_key == "phc_test_key"
        assert analytics._client.host == "https://eu.i.posthog.com"


class TestCaptureNoOp:
    def test_capture_is_noop_when_disabled(self, settings):
        settings.POSTHOG_ENABLED = False

        analytics.capture(uuid.uuid4(), "signup_completed")

        assert analytics.is_enabled() is False

    def test_unknown_event_is_dropped(self, caplog):
        client = _force_enabled_client()

        analytics.capture(uuid.uuid4(), "transaction_amount_spent", {"amount": "42"})

        client.capture.assert_not_called()

    def test_missing_distinct_id_is_dropped(self):
        client = _force_enabled_client()

        analytics.capture(None, "signup_completed", {"preferred_language": "fr"})

        client.capture.assert_not_called()

    def test_sdk_failure_is_swallowed(self):
        client = _force_enabled_client()
        client.capture.side_effect = RuntimeError("network gone")

        analytics.capture(uuid.uuid4(), "logout_completed")

        client.capture.assert_called_once()


class TestPropertyFiltering:
    def test_only_allowlisted_properties_are_sent(self):
        client = _force_enabled_client()
        user_id = uuid.uuid4()
        properties = {
            "preferred_language": "fr",
            "email": "leak@example.com",
            "name": "should not leak",
            "source": "mobile",
        }

        analytics.capture(SimpleNamespace(id=user_id), "signup_completed", properties)

        client.capture.assert_called_once()
        kwargs = client.capture.call_args.kwargs
        assert kwargs["distinct_id"] == str(user_id)
        assert kwargs["event"] == "signup_completed"
        assert kwargs["properties"] == {
            "preferred_language": "fr",
            "source": "mobile",
        }

    def test_financial_keys_are_stripped_from_transaction_event(self):
        client = _force_enabled_client()
        user_id = uuid.uuid4()
        properties = {
            "transaction_type": "expense",
            "entry_source": "manual",
            "has_category": True,
            "currency": "MAD",
            "amount": "199.50",
            "note": "Carrefour groceries",
            "description": "weekly shop",
            "category_name": "Alimentation",
            "account_name": "Cash",
        }

        analytics.capture(user_id, "transaction_created", properties)

        client.capture.assert_called_once()
        sent = client.capture.call_args.kwargs["properties"]
        assert sent == {
            "transaction_type": "expense",
            "entry_source": "manual",
            "has_category": True,
            "currency": "MAD",
        }

    def test_logout_event_has_empty_properties(self):
        client = _force_enabled_client()
        analytics.capture("user-123", "logout_completed", {"method": "explicit"})
        sent = client.capture.call_args.kwargs["properties"]
        assert sent == {}

    def test_uuid_user_is_coerced_to_string(self):
        client = _force_enabled_client()
        user_id = uuid.uuid4()
        analytics.capture(SimpleNamespace(id=user_id), "logout_completed")
        assert client.capture.call_args.kwargs["distinct_id"] == str(user_id)

    def test_aggregate_insights_event_keeps_only_counts(self):
        client = _force_enabled_client()
        properties = {
            "period": "2026-04",
            "users_processed": 10,
            "users_with_transactions": 7,
            "insights_created": 13,
            "duration_ms": 4521,
            "prompt": "do not log this",
            "response": "do not log this either",
            "metadata": {"top_categories": [{"name": "Alimentation", "amount": 1234}]},
        }

        analytics.capture("system", "insights_generation_completed", properties)

        sent = client.capture.call_args.kwargs["properties"]
        assert sent == {
            "period": "2026-04",
            "users_processed": 10,
            "users_with_transactions": 7,
            "insights_created": 13,
            "duration_ms": 4521,
        }
