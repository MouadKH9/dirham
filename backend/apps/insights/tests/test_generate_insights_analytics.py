"""Privacy-safe analytics integration tests for the generate_insights command."""

from __future__ import annotations

import sys
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest
from django.core.management import call_command


ALLOWED_AGGREGATE_KEYS = {
    "period",
    "users_processed",
    "users_with_transactions",
    "insights_created",
    "duration_ms",
}

FORBIDDEN_KEYS = {
    "amount",
    "amounts",
    "note",
    "notes",
    "description",
    "category_name",
    "account_name",
    "email",
    "prompt",
    "response",
    "metadata",
    "top_categories",
}


def _install_fake_genai():
    """Stub out google.genai to avoid network calls in tests."""
    google_module = sys.modules.get("google")
    if google_module is None:
        google_module = SimpleNamespace()
        sys.modules["google"] = google_module

    fake_client = MagicMock()
    fake_genai = SimpleNamespace(Client=MagicMock(return_value=fake_client))
    sys.modules["google.genai"] = fake_genai
    google_module.genai = fake_genai
    return fake_genai, fake_client


@pytest.mark.django_db
class TestGenerateInsightsAnalytics:
    def test_empty_run_emits_safe_aggregate_event(self):
        _install_fake_genai()

        with patch("apps.common.analytics.capture") as capture:
            call_command("generate_insights", "--period=2026-04")

        capture.assert_called_once()
        args, _ = capture.call_args
        distinct_id, event_name, properties = args

        assert distinct_id == "system"
        assert event_name == "insights_generation_completed"
        assert set(properties.keys()).issubset(ALLOWED_AGGREGATE_KEYS)
        assert properties["period"] == "2026-04"
        assert properties["users_processed"] == 0
        assert properties["users_with_transactions"] == 0
        assert properties["insights_created"] == 0
        assert isinstance(properties["duration_ms"], int)
        assert FORBIDDEN_KEYS.isdisjoint(properties.keys())

    def test_genai_client_failure_emits_failed_event(self):
        google_module = sys.modules.get("google") or SimpleNamespace()
        sys.modules["google"] = google_module
        fake_genai = SimpleNamespace(
            Client=MagicMock(side_effect=RuntimeError("boom"))
        )
        sys.modules["google.genai"] = fake_genai
        google_module.genai = fake_genai

        with patch("apps.common.analytics.capture") as capture:
            with pytest.raises(RuntimeError):
                call_command("generate_insights", "--period=2026-04")

        capture.assert_called_once()
        args, _ = capture.call_args
        distinct_id, event_name, properties = args

        assert distinct_id == "system"
        assert event_name == "insights_generation_failed"
        assert properties == {"period": "2026-04", "error_class": "RuntimeError"}
        assert FORBIDDEN_KEYS.isdisjoint(properties.keys())
