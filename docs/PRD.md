# PRD — Dirham: Personal Finance App

# Executive Summary

**Dirham** is a personal finance mobile app built for the Moroccan market. It solves a problem that no mainstream finance app addresses: giving Moroccan users a clean, Arabic/French-friendly tool to track daily spending in dirhams, manage recurring bills, and receive AI-powered insights about their habits — without requiring bank API integrations that don't exist in Morocco.

The app is designed around a simple philosophy: know where your money goes, catch bad habits early, and spend less time thinking about finances. It supports multiple accounts, recurring bill tracking, and weekly AI-generated awareness alerts powered by the Claude API. An optional Payoneer sync feature serves users who receive international income.

V1 targets core daily-use features: transaction management, categorized spending with Morocco-relevant defaults, dashboard overview, and periodic AI insights. The scope is deliberately narrow to ship a polished, complete product.


| Field         | Detail                                                       |
| ------------- | ------------------------------------------------------------ |
| Author        | Mouad K.                                                     |
| Status        | Draft                                                        |
| Version       | 1.0                                                          |
| Date          | April 2026                                                   |
| Target Market | Morocco (primary), MENA (secondary)                          |
| Stack         | React Native (Expo) · Django + DRF · PostgreSQL · Claude API |
| Hosting       | Railway (backend) · EAS (mobile builds)                      |


---

# Problem Statement

## Context

Morocco has over 30 million mobile users and a rapidly growing digital payments ecosystem (CMI, M-Wallet, Wafacash, etc.), yet there is no well-designed, locally relevant personal finance app. Moroccans manage their money across cash, bank cards, mobile wallets, and — for freelancers and diaspora — international platforms like Payoneer and Wise. Despite this complexity, the tools available are either generic global apps built for US/EU banking (Mint, YNAB) or basic bank apps that show balances but offer zero spending intelligence.

The result: most Moroccans have no structured view of where their money goes. They know their balance, not their habits.

## Core Problems

1. **No locally relevant finance app** — Global apps don't support MAD as a first-class currency, don't understand Moroccan spending patterns (souks, Carrefour, Marjane, JAWAZ tolls, café culture), and require Plaid-style bank integrations that don't exist in Morocco.
2. **Cash-heavy economy** — A significant portion of daily spending is cash-based and invisible to bank apps. Manual entry is the only way to capture it, but existing tools make manual entry too slow and painful.
3. **No spending awareness** — Without structured tracking, spending patterns go unnoticed. There's no system to flag that you spent 40% more on dining this Ramadan vs. last year, or that your subscriptions have quietly crept up.
4. **Scattered financial life** — Money lives across CIH/Attijariwafa/BMCE bank accounts, M-Wallet, cash, and possibly Payoneer. No single app gives a unified view.
5. **Language gap** — Most finance apps are English-only. Moroccan users need French and Arabic support to feel at home.

## Opportunity

Morocco is underserved by fintech for personal finance management. The opportunity is to build the app that Moroccan users would actually use daily — one that speaks their language, understands their categories, defaults to dirhams, and makes manual entry fast enough to capture cash spending. The first credible, well-designed personal finance app for Morocco has a genuine market opportunity beyond a single user.

---

# User Personas

## Primary Persona: The Urban Moroccan Professional


| Attribute             | Detail                                                                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Profile               | 22-35 years old, living in Casablanca, Rabat, Tangier, Marrakech, or Fès. Salaried or freelance.                                                 |
| Income                | 8,000–25,000 MAD/month via bank transfer or freelance platforms                                                                                  |
| Spending Mix          | ~40% cash (souks, cafés, taxis, small shops), ~40% card (supermarkets, restaurants, online), ~20% recurring (rent, internet, gym, subscriptions) |
| Financial Tools Today | Bank app (balance only), mental arithmetic, WhatsApp notes to self                                                                               |
| Language              | Darija daily, French professionally, Arabic formally. Comfortable with French or Arabic app UI.                                                  |
| Pain Points           | No idea where cash goes. Surprised by end-of-month balance. Bills sneak up. No spending trends. Global finance apps feel foreign and irrelevant. |
| Goals                 | Know exactly where money goes. Track cash spending without friction. Get alerts before overspending. See monthly trends.                         |
| Tech Comfort          | Comfortable with mobile apps (Instagram, WhatsApp, Jumia). Expects modern, fast UX.                                                              |


## Secondary Persona: The Moroccan Freelancer / Diaspora


| Attribute            | Detail                                                                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Profile              | Developer, designer, or digital worker receiving income in USD/EUR via Payoneer, Wise, or direct transfer                                         |
| Additional Need      | Track multi-currency income alongside MAD expenses. See unified view across Payoneer and local bank.                                              |
| Why They Need Dirham | Same daily-spending problems as the primary persona, plus the added complexity of foreign income that needs to be mentally converted and tracked. |


---

# Goals & Success Metrics

## Product Goals

1. **Become the go-to finance app for Moroccan users** — Fill the gap that no global app addresses.
2. **Make cash tracking effortless** — Transaction entry must be faster than any alternative, under 15 seconds.
3. **Surface actionable spending insights automatically** — Users learn about their habits without manual analysis.
4. **Respect the local context** — MAD-first, Morocco-relevant categories, French/Arabic support.

## Success Metrics


| Metric                        | Target                                      | How Measured           |
| ----------------------------- | ------------------------------------------- | ---------------------- |
| Daily active usage            | ≥5 days/week for 4 consecutive weeks        | App analytics          |
| Transaction entry time        | <15 seconds per transaction                 | UX observation         |
| Cash transaction capture rate | ≥70% of daily cash spending logged          | Self-reported          |
| AI insight relevance          | ≥3 out of 5 weekly insights feel actionable | Self-rated weekly      |
| Bill tracking coverage        | 100% of recurring bills tracked in-app      | Self-reported          |
| App Store rating (Morocco)    | ≥4.5 stars                                  | App Store / Play Store |


---

# Feature List — MoSCoW Prioritization

## Must Have (V1 Launch)


| ID   | Feature                         | Description                                                                                                                                                                                                                        |
| ---- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F-01 | Manual Transaction CRUD         | Add, edit, delete transactions with: amount (MAD default), category, date, notes, type (expense/income/bill). Optimized for speed — amount + category should take <10 seconds.                                                     |
| F-02 | Morocco-Relevant Categories     | Defaults: Logement, Alimentation (Courses), Restaurants & Cafés, Transport (Taxi/Bus/JAWAZ), Abonnements, Santé, Shopping, Loisirs, Factures (Eau/Électricité/Internet), Éducation, Dépenses Pro, Soins Personnels, Cadeaux, Autre |
| F-03 | Custom Categories               | User can create, rename, and archive custom categories                                                                                                                                                                             |
| F-04 | Recurring Bills                 | Mark bills as recurring (weekly/monthly/yearly) with reminders. Pre-seeded suggestions: Loyer, Inwi/IAM/Orange, Lydec/Amendis, Netflix, Gym, CNSS                                                                                  |
| F-05 | Multi-Account Support           | Multiple accounts: e.g. CIH, Attijariwafa, Cash, M-Wallet, Payoneer. Each has a name, currency (MAD default), and balance.                                                                                                         |
| F-06 | Dashboard — Balances            | Current balance for all accounts on home screen                                                                                                                                                                                    |
| F-07 | Dashboard — Recent Transactions | Last 10 transactions across all accounts, reverse chronological                                                                                                                                                                    |
| F-08 | Dashboard — Monthly Summary     | Total income, total expenses, net for current month in MAD                                                                                                                                                                         |
| F-09 | JWT Authentication              | Token-based auth, refresh token rotation                                                                                                                                                                                           |
| F-10 | AI Spending Breakdown           | Claude-generated weekly/monthly category breakdown with trend comparison to prior period                                                                                                                                           |
| F-11 | AI Anomaly Detection            | Detect unusual spikes (e.g. "Your transport spending doubled this week")                                                                                                                                                           |
| F-12 | AI Awareness Alerts             | Plain-language alerts: "Tu as dépensé 40% de plus en restaurants ce mois-ci" — stored server-side, fetched on app open                                                                                                             |


## Should Have (V1 if time allows)


| ID   | Feature                     | Description                                                                                                                         |
| ---- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| F-13 | French & Arabic UI          | Full app localization in French and Arabic (RTL support). Darija for AI insight copy where natural.                                 |
| F-14 | Dashboard — Budget Progress | Set monthly budget per category, show progress bar                                                                                  |
| F-15 | Transaction Search & Filter | Filter by date range, category, account, type. Free-text search on notes.                                                           |
| F-16 | Quick-Add Shortcuts         | Predefined shortcuts for common Moroccan expenses: "Café" (8-15 MAD), "Taxi" (10-30 MAD), "Courses Carrefour/Marjane", "JAWAZ" toll |
| F-17 | Push Notifications          | Notify on bill due dates and AI insight availability                                                                                |
| F-18 | Payoneer Auto-Sync          | Daily cron job polls Payoneer API, fetches new transactions and current balance. Dedup by external transaction ID.                  |


## Could Have (Post-V1)


| ID   | Feature                        | Description                                                                                                                    |
| ---- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| F-19 | Ramadan Mode                   | Special tracking for Ramadan spending patterns (ftour groceries, charity/zakat, Eid gifts). Year-over-year Ramadan comparison. |
| F-20 | Export to CSV                  | Download transaction history for tax/accounting                                                                                |
| F-21 | Dark Mode                      | System-preference-aware dark theme                                                                                             |
| F-22 | Receipt Photo Attach           | Attach photo to a transaction                                                                                                  |
| F-23 | Expense Shorthands             | Custom aliases: "CARRE" → Carrefour/Alimentation, "JAWAZ" → Highway Toll/Transport                                             |
| F-24 | Multi-Currency with Live Rates | Fetch USD/MAD and EUR/MAD rates daily from Bank Al-Maghrib, show converted totals                                              |
| F-25 | Yearly Summary & Tax View      | Annual income/expense summary aligned with Moroccan SARL/auto-entrepreneur tax filing                                          |
| F-26 | Zakat Calculator               | Calculate zakat obligations based on tracked savings and income                                                                |


## Won't Have (V1)


| ID   | Feature                      | Reason                                                                |
| ---- | ---------------------------- | --------------------------------------------------------------------- |
| F-27 | AI Chatbot                   | Adds complexity without proportional value for daily use              |
| F-28 | Bank API Integration         | No open banking APIs in Morocco; manual entry is the correct solution |
| F-29 | Multi-User / Shared Accounts | Solo-user app in V1; household finance is a V2+ consideration         |
| F-30 | Investment Tracking          | Out of scope — separate concern                                       |
| F-31 | Real-Time Payoneer Webhooks  | Not supported by Payoneer; daily polling is sufficient                |


---

# User Stories

## Transaction Management

- **US-01**: As a user, I can add a new expense in under 15 seconds by entering amount in MAD, selecting a category, and saving — date defaults to today and notes are optional.
- **US-02**: As a user, I can edit any transaction's details after creation to fix mistakes.
- **US-03**: As a user, I can delete a transaction to remove erroneous entries.
- **US-04**: As a user, I can mark a transaction as a recurring bill with a set frequency so that I'm reminded of upcoming obligations.
- **US-05**: As a user, I can view all my transactions in a scrollable list with filters for date, category, and account.
- **US-06**: As a user, I can use quick-add shortcuts for common expenses like "Café" or "Taxi" that pre-fill category and typical amount.

## Accounts

- **US-07**: As a user, I can create multiple accounts (CIH, Cash, M-Wallet, etc.) each with their own name, currency, and balance.
- **US-08**: As a user, I can see all account balances on my dashboard at a glance.
- **US-09**: As a user, transactions I add are associated with a specific account.

## Dashboard & Insights

- **US-10**: As a user, I can open the app and immediately see my balances, recent transactions, and monthly summary.
- **US-11**: As a user, I receive AI-generated insights about my spending patterns each week in French (or Arabic), ready when I open the app.
- **US-12**: As a user, I am alerted when my spending in any category is significantly higher than my historical average.
- **US-13**: As a user, I can view a breakdown of my spending by category for the current and previous months.

## Authentication

- **US-14**: As a user, I can log in with email and password and remain authenticated via JWT until I explicitly log out.
- **US-15**: As a user, my session persists across app restarts via secure token storage.

## Payoneer Sync (Optional)

- **US-16**: As a user with a Payoneer account, transactions and balance are synced automatically each day.
- **US-17**: As a user, I am notified if a Payoneer sync fails.

---

# Data Models

## Entity Relationship Overview

```
User 1──* Account 1──* Transaction *──1 Category
User 1──* Budget
User 1──* AIInsight
Category 1──* RecurringBill 1──* Transaction
```

## Model Definitions

### User


| Field              | Type     | Notes                            |
| ------------------ | -------- | -------------------------------- |
| id                 | UUID     | Primary key                      |
| email              | string   | Unique, used for login           |
| password           | string   | Hashed (Django's default hasher) |
| preferred_language | enum     | `fr`, `ar`, `en` — default `fr`  |
| preferred_currency | string   | ISO 4217, default "MAD"          |
| created_at         | datetime | Auto-set                         |


### Account


| Field          | Type          | Notes                                      |
| -------------- | ------------- | ------------------------------------------ |
| id             | UUID          | Primary key                                |
| user           | FK → User     | Owner                                      |
| name           | string        | e.g. "CIH", "Cash", "M-Wallet", "Payoneer" |
| type           | enum          | `manual` or `synced`                       |
| currency       | string        | ISO 4217: "MAD" (default), "USD", "EUR"    |
| balance        | decimal(12,2) | Current balance                            |
| last_synced_at | datetime      | Nullable; only for synced accounts         |
| created_at     | datetime      | Auto-set                                   |


### Category


| Field       | Type      | Notes                                       |
| ----------- | --------- | ------------------------------------------- |
| id          | UUID      | Primary key                                 |
| user        | FK → User | Nullable for system defaults                |
| name_fr     | string    | French name, e.g. "Alimentation"            |
| name_ar     | string    | Arabic name, e.g. "تغذية"                   |
| name_en     | string    | English fallback                            |
| icon        | string    | Emoji or icon identifier                    |
| is_system   | boolean   | True for predefined, false for user-created |
| is_archived | boolean   | Soft-delete for custom categories           |
| created_at  | datetime  | Auto-set                                    |


### Transaction


| Field          | Type               | Notes                                      |
| -------------- | ------------------ | ------------------------------------------ |
| id             | UUID               | Primary key                                |
| user           | FK → User          | Owner                                      |
| account        | FK → Account       | Which account                              |
| category       | FK → Category      | Spending category                          |
| type           | enum               | `income`, `expense`, `bill`                |
| amount         | decimal(12,2)      | Always positive; type determines direction |
| currency       | string             | Defaults to account currency               |
| date           | date               | When the transaction occurred              |
| notes          | text               | Optional free-text                         |
| is_recurring   | boolean            | Whether linked to a recurring bill         |
| recurring_bill | FK → RecurringBill | Nullable                                   |
| external_id    | string             | Nullable; for dedup on synced transactions |
| source         | enum               | `manual` or `auto_sync`                    |
| created_at     | datetime           | Auto-set                                   |
| updated_at     | datetime           | Auto-updated                               |


### RecurringBill


| Field         | Type          | Notes                                    |
| ------------- | ------------- | ---------------------------------------- |
| id            | UUID          | Primary key                              |
| user          | FK → User     | Owner                                    |
| category      | FK → Category | Bill category                            |
| name          | string        | e.g. "Loyer", "Inwi", "Netflix", "Lydec" |
| amount        | decimal(12,2) | Expected amount in MAD                   |
| frequency     | enum          | `weekly`, `monthly`, `yearly`            |
| next_due_date | date          | Next expected payment date               |
| is_active     | boolean       | Can be paused                            |
| created_at    | datetime      | Auto-set                                 |


### Budget


| Field      | Type          | Notes                         |
| ---------- | ------------- | ----------------------------- |
| id         | UUID          | Primary key                   |
| user       | FK → User     | Owner                         |
| category   | FK → Category | Budget target category        |
| amount     | decimal(12,2) | Monthly limit in MAD          |
| month      | date          | First day of the budget month |
| created_at | datetime      | Auto-set                      |


### AIInsight


| Field        | Type      | Notes                                  |
| ------------ | --------- | -------------------------------------- |
| id           | UUID      | Primary key                            |
| user         | FK → User | Owner                                  |
| type         | enum      | `breakdown`, `anomaly`, `awareness`    |
| title        | string    | Short headline (localized)             |
| body         | text      | Full insight content (localized)       |
| language     | enum      | `fr`, `ar`, `en`                       |
| period_start | date      | Analysis period start                  |
| period_end   | date      | Analysis period end                    |
| severity     | enum      | `info`, `warning`, `critical`          |
| is_read      | boolean   | Tracks if user has seen it             |
| metadata     | jsonb     | Raw data (category amounts, % changes) |
| generated_at | datetime  | When Claude produced it                |
| created_at   | datetime  | Auto-set                               |


### SyncLog


| Field                | Type         | Notes                          |
| -------------------- | ------------ | ------------------------------ |
| id                   | UUID         | Primary key                    |
| account              | FK → Account | Which synced account           |
| status               | enum         | `success`, `partial`, `failed` |
| transactions_fetched | int          | Count of new transactions      |
| balance_updated      | boolean      | Whether balance was refreshed  |
| error_message        | text         | Nullable                       |
| started_at           | datetime     | Job start                      |
| completed_at         | datetime     | Job end                        |


---

# API Surface Overview

All endpoints prefixed with `/api/v1/`. Authentication via JWT Bearer token on every request except `/auth/login/` and `/auth/register/`.

## Authentication


| Method | Endpoint          | Description                     |
| ------ | ----------------- | ------------------------------- |
| POST   | `/auth/register/` | Create user account             |
| POST   | `/auth/login/`    | Returns access + refresh tokens |
| POST   | `/auth/refresh/`  | Refresh access token            |
| POST   | `/auth/logout/`   | Blacklist refresh token         |


## Accounts


| Method | Endpoint          | Description                     |
| ------ | ----------------- | ------------------------------- |
| GET    | `/accounts/`      | List all accounts with balances |
| POST   | `/accounts/`      | Create a new account            |
| GET    | `/accounts/{id}/` | Account detail                  |
| PATCH  | `/accounts/{id}/` | Update account                  |


## Transactions


| Method | Endpoint                 | Description                                                                                    |
| ------ | ------------------------ | ---------------------------------------------------------------------------------------------- |
| GET    | `/transactions/`         | List with filters: `?account=`, `?category=`, `?type=`, `?date_from=`, `?date_to=`, `?search=` |
| POST   | `/transactions/`         | Create new transaction                                                                         |
| GET    | `/transactions/{id}/`    | Detail                                                                                         |
| PUT    | `/transactions/{id}/`    | Full update                                                                                    |
| PATCH  | `/transactions/{id}/`    | Partial update                                                                                 |
| DELETE | `/transactions/{id}/`    | Delete                                                                                         |
| GET    | `/transactions/summary/` | Monthly summary: total income, expenses, net                                                   |


## Categories


| Method | Endpoint            | Description                                                                        |
| ------ | ------------------- | ---------------------------------------------------------------------------------- |
| GET    | `/categories/`      | List all (system + custom). Respects `Accept-Language` header for localized names. |
| POST   | `/categories/`      | Create custom category                                                             |
| PATCH  | `/categories/{id}/` | Rename or archive                                                                  |


## Recurring Bills


| Method | Endpoint       | Description              |
| ------ | -------------- | ------------------------ |
| GET    | `/bills/`      | List all recurring bills |
| POST   | `/bills/`      | Create recurring bill    |
| PATCH  | `/bills/{id}/` | Update bill details      |
| DELETE | `/bills/{id}/` | Remove bill              |


## Budgets


| Method | Endpoint         | Description                    |
| ------ | ---------------- | ------------------------------ |
| GET    | `/budgets/`      | List budgets for current month |
| POST   | `/budgets/`      | Set budget for category/month  |
| PATCH  | `/budgets/{id}/` | Update budget amount           |


## AI Insights


| Method | Endpoint                  | Description                                                          |
| ------ | ------------------------- | -------------------------------------------------------------------- |
| GET    | `/insights/`              | List insights, newest first. Filter: `?type=`, `?is_read=`, `?lang=` |
| GET    | `/insights/{id}/`         | Detail                                                               |
| PATCH  | `/insights/{id}/`         | Mark as read                                                         |
| GET    | `/insights/unread-count/` | Badge count for UI                                                   |


## Dashboard


| Method | Endpoint      | Description                                                                                       |
| ------ | ------------- | ------------------------------------------------------------------------------------------------- |
| GET    | `/dashboard/` | Aggregated: balances, recent transactions, monthly summary, unread insight count, budget progress |


---

# Technical Architecture

## Tech Stack Justification


| Layer             | Choice                      | Rationale                                                                                                                  |
| ----------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Mobile Framework  | React Native (Expo)         | Cross-platform. Expo simplifies builds and OTA updates.                                                                    |
| Backend Framework | Django + DRF                | Battle-tested ORM for financial data, built-in admin, mature auth (SimpleJWT).                                             |
| Database          | PostgreSQL                  | ACID compliance for financial data. JSONB for insight metadata.                                                            |
| AI Engine         | Claude API (Anthropic)      | Strong structured-output for categorized insights. Cost-effective for batch usage. Supports French/Arabic output natively. |
| Auth              | JWT (SimpleJWT)             | Stateless, mobile-friendly.                                                                                                |
| Hosting — Backend | Railway                     | Simple deployment, cron support, PostgreSQL add-on.                                                                        |
| Hosting — Mobile  | EAS (Expo)                  | Managed builds for iOS and Android.                                                                                        |
| i18n              | react-i18next + Django i18n | Industry-standard localization for both frontend and backend. Arabic RTL support via React Native's I18nManager.           |


## System Architecture

```
┌─────────────────────┐
│   React Native App  │
│   (Expo / EAS)      │
│                     │
│  - Zustand state    │
│  - Axios            │
│  - SecureStore      │
│  - i18n (FR/AR/EN)  │
└────────┬────────────┘
         │ HTTPS / JWT
         ▼
┌─────────────────────┐      ┌──────────────────┐
│  Django + DRF       │◄────►│  PostgreSQL      │
│  (Railway)          │      │  (Railway add-on) │
│                     │      └──────────────────┘
│  - REST API         │
│  - SimpleJWT Auth   │
│  - Django i18n      │
│  - Cron: Insights   │──────► Claude API
│  - Cron: Auto-Sync  │──────► External APIs
│  - Admin panel      │
└─────────────────────┘
```

## Scheduled Jobs


| Job                 | Schedule                 | Description                                                                                                      |
| ------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `generate_insights` | Weekly, Sunday 07:00 UTC | Aggregate transactions, send to Claude API with user's language preference, store localized `AIInsight` records. |
| `bill_reminders`    | Daily, 08:00 UTC         | Check `RecurringBill.next_due_date`. Push notification for bills due within 2 days.                              |
| `auto_sync`         | Daily, 06:00 UTC         | For `synced` accounts: poll external API, fetch transactions, update balance, log to `SyncLog`.                  |


## AI Insights — Implementation Detail

Insights are batch-produced by a scheduled Django management command, not per-request.

**Flow:**

1. Cron triggers `python manage.py generate_insights`.
2. Aggregates transaction data: totals by category, daily spend, week-over-week and month-over-month deltas.
3. Sends structured prompt to Claude API with explicit JSON output schema. Prompt includes user's language preference and Moroccan cultural context (e.g. Ramadan periods, Eid spending).
4. Claude returns insight objects typed as `breakdown`, `anomaly`, or `awareness`.
5. Command creates `AIInsight` records. App fetches on next open.

**Prompt design:**

- Request output in user's preferred language (French or Arabic).
- Include Moroccan context: Ramadan dates, major holidays, typical spending patterns.
- Cap to 5 insights per run to avoid noise.
- Include historical averages for relative anomaly detection.

**Cost estimate:** ~$0.05–$0.15 per weekly run (Sonnet-tier).

## Account Sync — Implementation Detail (Payoneer)

Account sync is an optional feature for `synced` type accounts. V1 supports Payoneer; the architecture is extensible.

**Flow:**

1. Cron triggers `python manage.py auto_sync`.
2. For each `synced` account, run the appropriate adapter.
3. Fetch transactions since `last_synced_at`, dedup by `external_id`.
4. Create `Transaction` records with `source=auto_sync`.
5. Update balance and `last_synced_at`. Log to `SyncLog`.

**Error handling:** On failure, log error, push notification, retry once after 30 minutes.

---

# Localization Strategy


| Aspect      | Approach                                                                                       |
| ----------- | ---------------------------------------------------------------------------------------------- |
| App UI      | French (default), Arabic, English. Managed via react-i18next.                                  |
| RTL Support | Arabic layout via React Native's I18nManager. Tested on both iOS and Android.                  |
| Categories  | Stored with `name_fr`, `name_ar`, `name_en`. Served based on `Accept-Language`.                |
| AI Insights | Generated in user's preferred language via Claude prompt.                                      |
| Currency    | MAD as default. Displayed as "XX.XX MAD" or "XX,XX DH" based on locale.                        |
| Numbers     | French locale uses comma as decimal separator. Arabic uses Eastern Arabic numerals optionally. |


---

# Security Considerations

- **Authentication**: JWT with short-lived access tokens (15 min) and longer refresh tokens (7 days). Rotation enabled.
- **Token storage**: `expo-secure-store` for encrypted on-device storage. Never AsyncStorage.
- **API keys**: All stored as Railway environment variables.
- **HTTPS only**: `SECURE_SSL_REDIRECT=True` in production.
- **CORS**: Locked to app domain.
- **Data privacy**: Financial data stays on the server. No third-party analytics SDKs that transmit transaction data. Compliant with Moroccan data protection law (Loi 09-08 / CNDP).
- **Admin panel**: Django admin restricted to superuser.

---

# V2 Considerations


| Feature                       | Notes                                                                                       |
| ----------------------------- | ------------------------------------------------------------------------------------------- |
| **Ramadan Mode**              | Special tracking for Ramadan spending (ftour, zakat, Eid gifts). Year-over-year comparison. |
| **Receipt OCR**               | Photo → Claude Vision extracts amount, vendor, date → auto-fills transaction.               |
| **Zakat Calculator**          | Calculate zakat based on tracked savings and income over the year.                          |
| **Cash Flow Forecasting**     | Recurring bills + income patterns → 30/60/90-day cash projection. Claude-powered.           |
| **Expense Shorthands**        | Aliases: "CARRE" → Carrefour/Alimentation, "JAWAZ" → Tolls/Transport.                       |
| **Widget (iOS/Android)**      | Home screen widget showing balance and today's spending.                                    |
| **Multi-Currency Live Rates** | Daily USD/MAD and EUR/MAD from Bank Al-Maghrib.                                             |
| **Tax Summary**               | Annual summary aligned with Moroccan SARL/auto-entrepreneur tax filing.                     |
| **Biometric Auth**            | FaceID / fingerprint via `expo-local-authentication`.                                       |
| **Offline-First**             | Queue transactions offline, sync on reconnect (WatermelonDB).                               |
| **Household Accounts**        | Shared tracking for couples/families.                                                       |
| **Darija AI Voice**           | Voice-to-transaction in Moroccan Darija (Whisper + Claude).                                 |
| **CMI / M-Wallet Sync**       | If APIs become available, auto-sync card and mobile wallet transactions.                    |


---

# Development Phases

## Phase 1 — Foundation (Weeks 1–2)

- Django project setup, PostgreSQL on Railway, JWT auth, User/Account/Category models
- React Native (Expo) project setup, navigation, auth flow, secure token storage
- Seed Morocco-relevant predefined categories (FR/AR/EN)
- Basic transaction CRUD (API + UI)
- i18n framework setup (react-i18next + Django i18n)

## Phase 2 — Core Features (Weeks 3–4)

- Full transaction management UI: list, filters, search
- Quick-add shortcuts for common Moroccan expenses
- Recurring bills model + UI with pre-seeded Moroccan bills
- Dashboard screen: balances, recent transactions, monthly summary
- Budget model + progress display

## Phase 3 — Intelligence (Weeks 5–6)

- Claude API integration: aggregation, prompt engineering with Moroccan context, insight storage
- Insights screen with read/unread states
- Localized insight generation (French/Arabic)
- Push notifications for bill reminders and new insights

## Phase 4 — Sync & Polish (Week 7)

- Payoneer sync adapter (optional): OAuth, cron, SyncLog, error handling
- Arabic RTL polish pass
- Error states, empty states, loading skeletons
- EAS build configuration (iOS + Android)

---

# Open Questions

1. **Language priority**: Should V1 ship French-only and add Arabic in a fast follow, or ship both simultaneously? (Recommendation: French first, Arabic within 2 weeks of launch.)
2. **Claude model tier**: Haiku for cost or Sonnet for quality? Start with Sonnet, especially for French/Arabic output quality.
3. **Currency display**: "MAD" (ISO standard) vs. "DH" (colloquial)? Consider user setting.
4. **Notification service**: Expo Push Notifications (free, simpler) vs. Firebase Cloud Messaging?
5. **State management**: Zustand (lighter) vs. Redux Toolkit. Zustand is the leading candidate.
6. **Cash account**: Should the app create a default "Cash / نقود" account on signup? (Recommendation: yes.)
7. **Moroccan data protection**: Verify compliance with Loi 09-08 and CNDP registration requirements before public launch.
8. **App Store presence**: Prioritize Morocco region on both App Store and Play Store. Consider Arabic App Store listing.

[Claude Code — Project Bootstrap Prompt](https://www.notion.so/Claude-Code-Project-Bootstrap-Prompt-33e25fc914a6814ca81ee80fc6b822d9?pvs=21)