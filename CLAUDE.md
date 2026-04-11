# Dirham — Personal Finance App for Morocco

## Project Overview

Dirham is a personal finance mobile app built for the Moroccan market. It gives users a clean, Arabic/French-friendly tool to track daily spending in dirhams, manage recurring bills, and receive AI-powered insights — without requiring bank API integrations.

- **Target market:** Morocco (primary), MENA (secondary)
- **Philosophy:** Know where your money goes, catch bad habits early, spend less time thinking about finances
- **V1 scope:** Transaction management, categorized spending, dashboard overview, periodic AI insights

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native (Expo), Zustand, Axios, expo-secure-store, react-i18next |
| Backend | Django + Django REST Framework, SimpleJWT |
| Database | PostgreSQL (JSONB for insight metadata) |
| AI | Claude API (Anthropic) — batch insights, not per-request |
| Hosting | Railway (backend + PostgreSQL), EAS (mobile builds) |

## Project Structure

```
dirham/
├── docs/           # Product documentation (PRD, etc.)
├── backend/        # Django + DRF API (to be created)
│   ├── accounts/   # Account management app
│   ├── transactions/ # Transaction CRUD app
│   ├── categories/ # Category management app
│   ├── bills/      # Recurring bills app
│   ├── budgets/    # Budget tracking app
│   ├── insights/   # AI insights app
│   └── sync/       # Payoneer sync app
└── mobile/         # React Native (Expo) app (to be created)
```

## API Conventions

- All endpoints prefixed with `/api/v1/`
- JWT Bearer token auth on all endpoints except `/auth/login/` and `/auth/register/`
- Currency amounts use `decimal(12,2)`, always positive (type field determines direction)
- All primary keys are UUIDs
- Dates: ISO 8601 format
- Localization: `Accept-Language` header controls response language (fr/ar/en)

## Data Models

Core entities: User, Account, Category, Transaction, RecurringBill, Budget, AIInsight, SyncLog

Key relationships:
- User 1--* Account 1--* Transaction *--1 Category
- User 1--* Budget, User 1--* AIInsight
- Category 1--* RecurringBill 1--* Transaction

## Key Design Decisions

- **Manual-first:** No bank API integrations (don't exist in Morocco). Manual entry optimized for speed (<15 seconds).
- **Cash tracking:** Default "Cash" account created on signup — cash is ~40% of user spending.
- **MAD-first:** Dirham is the default currency everywhere. Multi-currency support exists for Payoneer/international income.
- **AI insights are batch:** Generated weekly via Django management command (`generate_insights`), not real-time. Stored server-side, fetched on app open.
- **Categories are trilingual:** Each category stores `name_fr`, `name_ar`, `name_en`. System defaults are Morocco-relevant (Alimentation, Transport/JAWAZ, Factures, etc.).

## Scheduled Jobs

| Job | Schedule | Purpose |
|-----|----------|---------|
| `generate_insights` | Weekly, Sunday 07:00 UTC | Aggregate transactions, send to Claude API, store AIInsight records |
| `bill_reminders` | Daily, 08:00 UTC | Push notifications for bills due within 2 days |
| `auto_sync` | Daily, 06:00 UTC | Poll external APIs for synced accounts, update balances |

## Security Requirements

- JWT: 15-min access tokens, 7-day refresh tokens with rotation
- Token storage: `expo-secure-store` only (never AsyncStorage)
- API keys: environment variables only (Railway)
- HTTPS only (`SECURE_SSL_REDIRECT=True` in production)
- CORS locked to app domain
- No third-party analytics SDKs that transmit transaction data
- Django admin restricted to superuser

## Localization

- Languages: French (default), Arabic, English
- Arabic requires RTL support via React Native's `I18nManager`
- AI insights generated in user's preferred language via Claude prompt
- Currency display: configurable "MAD" (ISO) vs "DH" (colloquial)
- French locale: comma as decimal separator

## Development Phases

1. **Foundation** — Django setup, PostgreSQL, JWT auth, models, Expo project, auth flow, category seeds, basic transaction CRUD, i18n framework
2. **Core Features** — Full transaction UI, quick-add shortcuts, recurring bills, dashboard, budgets
3. **Intelligence** — Claude API integration, insights screen, localized generation, push notifications
4. **Sync & Polish** — Payoneer sync, RTL polish, error/empty/loading states, EAS builds

## Commands

```bash
# Backend (to be set up)
cd backend && python manage.py runserver       # Dev server
cd backend && python manage.py test            # Run tests
cd backend && python manage.py migrate         # Apply migrations
cd backend && python manage.py generate_insights  # Manual insight generation

# Mobile (to be set up)
cd mobile && npx expo start                    # Dev server
cd mobile && npx expo start --ios              # iOS simulator
cd mobile && npx expo start --android          # Android emulator
```
