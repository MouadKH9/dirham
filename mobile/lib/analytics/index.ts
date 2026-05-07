/**
 * Privacy-first analytics wrapper around the PostHog React Native SDK.
 *
 * The wrapper enforces an allowlist of event names and per-event property
 * keys so that financial payloads (amounts, notes, merchant or category
 * names, emails, tokens, raw error messages, etc.) cannot leak into
 * analytics. It also no-ops cleanly when the env key is missing.
 *
 * Initialize once via {@link getPostHogClient} (called from the provider in
 * `app/_layout.tsx`). Application code should only use the typed helpers
 * exported from this module.
 */

import PostHog from 'posthog-react-native';
import type { JsonType, PostHogEventProperties } from '@posthog/core';
import type { User } from '@/lib/types';

export const POSTHOG_KEY: string | undefined = process.env.EXPO_PUBLIC_POSTHOG_KEY;
export const POSTHOG_HOST: string =
  process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';

export const isAnalyticsEnabled: boolean = Boolean(POSTHOG_KEY);

type EventMap = {
  signup_completed: { preferred_language: User['preferred_language']; source?: 'mobile' | 'backend' };
  login_completed: { method: 'password' };
  logout_completed: Record<string, never>;
  transaction_created: {
    transaction_type: 'income' | 'expense' | 'bill';
    entry_source: 'manual' | 'auto_sync';
    has_category: boolean;
    currency: string;
  };
  category_created: { is_system: boolean };
  budget_created: { period: string };
  recurring_bill_created: { frequency: 'weekly' | 'monthly' | 'yearly' };
  insight_viewed: {
    insight_type: 'breakdown' | 'anomaly' | 'awareness';
    severity: 'info' | 'warning' | 'critical';
    language: User['preferred_language'];
  };
  ai_insights_enabled: Record<string, never>;
  ai_insights_disabled: Record<string, never>;
};

export type AnalyticsEventName = keyof EventMap;

const EVENT_ALLOWLIST: { [K in AnalyticsEventName]: ReadonlyArray<keyof EventMap[K] & string> } = {
  signup_completed: ['preferred_language', 'source'],
  login_completed: ['method'],
  logout_completed: [],
  transaction_created: ['transaction_type', 'entry_source', 'has_category', 'currency'],
  category_created: ['is_system'],
  budget_created: ['period'],
  recurring_bill_created: ['frequency'],
  insight_viewed: ['insight_type', 'severity', 'language'],
  ai_insights_enabled: [],
  ai_insights_disabled: [],
};

let _client: PostHog | null = null;

export function getPostHogClient(): PostHog | null {
  if (_client) return _client;
  if (!POSTHOG_KEY) return null;

  try {
    _client = new PostHog(POSTHOG_KEY, {
      host: POSTHOG_HOST,
      captureAppLifecycleEvents: true,
      enableSessionReplay: false,
    });
  } catch (error) {
    console.warn('Failed to initialize PostHog client', error);
    _client = null;
  }

  return _client;
}

export function resetClientForTests(): void {
  _client = null;
}

function pickAllowed<K extends AnalyticsEventName>(
  eventName: K,
  properties: EventMap[K] | undefined,
): PostHogEventProperties {
  const allowedKeys = EVENT_ALLOWLIST[eventName];
  if (!properties || allowedKeys.length === 0) return {};

  const safe: PostHogEventProperties = {};
  for (const key of allowedKeys) {
    const value = (properties as Record<string, JsonType>)[key];
    if (value !== undefined) {
      safe[key] = value;
    }
  }
  return safe;
}

export function captureEvent<K extends AnalyticsEventName>(
  eventName: K,
  properties?: EventMap[K],
): void {
  const client = getPostHogClient();
  if (!client) return;

  try {
    const safeProperties = pickAllowed(eventName, properties);
    client.capture(eventName, safeProperties);
  } catch (error) {
    console.warn(`Failed to capture analytics event ${eventName}`, error);
  }
}

export function identifyUser(user: Pick<User, 'id' | 'preferred_language'>): void {
  const client = getPostHogClient();
  if (!client) return;

  try {
    client.identify(user.id, {
      preferred_language: user.preferred_language,
    });
  } catch (error) {
    console.warn('Failed to identify analytics user', error);
  }
}

export function resetAnalytics(): void {
  const client = getPostHogClient();
  if (!client) return;

  try {
    client.reset();
  } catch (error) {
    console.warn('Failed to reset analytics state', error);
  }
}
