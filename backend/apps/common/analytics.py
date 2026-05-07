"""Privacy-first analytics wrapper around the PostHog Python SDK.

This module enforces a strict allowlist of event names and per-event property
keys so that financial payloads (amounts, notes, merchant or category names,
emails, tokens, raw error messages, etc.) cannot leak into analytics. It also
no-ops cleanly when analytics is disabled or unconfigured.

Call :func:`init_analytics` once from ``AppConfig.ready()``. Application code
should only use :func:`capture`.
"""

from __future__ import annotations

import logging
import uuid
from typing import Any, Mapping

from django.conf import settings

logger = logging.getLogger(__name__)

EVENT_SCHEMA: dict[str, frozenset[str]] = {
    "signup_completed": frozenset({"preferred_language", "source"}),
    "login_completed": frozenset({"method"}),
    "logout_completed": frozenset(),
    "transaction_created": frozenset(
        {"transaction_type", "entry_source", "has_category", "currency"}
    ),
    "category_created": frozenset({"is_system"}),
    "budget_created": frozenset({"period"}),
    "recurring_bill_created": frozenset({"frequency"}),
    "insight_viewed": frozenset({"insight_type", "severity", "language"}),
    "insights_generation_completed": frozenset(
        {
            "period",
            "users_processed",
            "users_with_transactions",
            "insights_created",
            "duration_ms",
        }
    ),
    "insights_generation_failed": frozenset({"period", "error_class"}),
}

_initialized: bool = False
_client: Any | None = None


def init_analytics() -> None:
    """Configure the PostHog SDK once per process.

    Safe to call multiple times. Becomes a no-op when ``POSTHOG_ENABLED`` is
    false or ``POSTHOG_API_KEY`` is empty so tests and local development never
    transmit events by default.
    """
    global _initialized, _client

    if _initialized:
        return

    enabled = getattr(settings, "POSTHOG_ENABLED", False)
    api_key = getattr(settings, "POSTHOG_API_KEY", "")
    host = getattr(settings, "POSTHOG_HOST", "https://us.i.posthog.com")

    if not enabled or not api_key:
        _initialized = True
        _client = None
        return

    try:
        import posthog

        posthog.api_key = api_key
        posthog.host = host
        posthog.disabled = False
        _client = posthog
    except Exception:
        logger.exception("Failed to initialize PostHog client; analytics disabled")
        _client = None
    finally:
        _initialized = True


def reset_for_tests() -> None:
    """Reset module state so tests can re-run :func:`init_analytics`."""
    global _initialized, _client
    _initialized = False
    _client = None


def is_enabled() -> bool:
    return _client is not None


def _coerce_distinct_id(user_or_id: Any) -> str | None:
    if user_or_id is None:
        return None

    candidate = getattr(user_or_id, "id", user_or_id)
    if isinstance(candidate, uuid.UUID):
        return str(candidate)
    if isinstance(candidate, (str, int)):
        text = str(candidate).strip()
        return text or None
    return None


def _filter_properties(
    event_name: str, properties: Mapping[str, Any] | None
) -> dict[str, Any]:
    allowed = EVENT_SCHEMA.get(event_name, frozenset())
    if not properties:
        return {}
    return {key: value for key, value in properties.items() if key in allowed}


def capture(
    user_or_id: Any,
    event_name: str,
    properties: Mapping[str, Any] | None = None,
) -> None:
    """Send a privacy-filtered analytics event.

    Drops the event silently when:

    - the event is not in :data:`EVENT_SCHEMA`,
    - analytics is disabled or unconfigured,
    - or no usable distinct id can be derived from ``user_or_id``.

    Properties that are not in the per-event allowlist are stripped before the
    payload reaches the PostHog SDK.
    """
    if not _initialized:
        init_analytics()

    if event_name not in EVENT_SCHEMA:
        logger.warning("Dropping unknown analytics event: %s", event_name)
        return

    if not is_enabled():
        return

    distinct_id = _coerce_distinct_id(user_or_id)
    if not distinct_id:
        logger.warning(
            "Dropping analytics event %s due to missing distinct_id", event_name
        )
        return

    safe_properties = _filter_properties(event_name, properties)

    try:
        assert _client is not None
        _client.capture(
            distinct_id=distinct_id,
            event=event_name,
            properties=safe_properties,
        )
    except Exception:
        logger.exception("Failed to capture analytics event %s", event_name)
