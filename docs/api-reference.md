# Dirham API Reference

**Base URL:** `https://<host>/api/v1/`  
**Auth:** Bearer JWT — `Authorization: Bearer <access_token>` on all endpoints except `/auth/register/` and `/auth/login/`  
**Content-Type:** `application/json`  
**Localization:** `Accept-Language: fr | ar | en` — controls `name` field on categories (defaults to `fr`)  
**Pagination:** `?page=N&page_size=N` (default 20, max 100) — all list endpoints return `{ count, next, previous, results[] }`  
**Dates:** ISO 8601 — `YYYY-MM-DD`  
**Amounts:** decimal string — `"1250.00"` (always positive; `type` field determines direction)  
**IDs:** UUID v4 strings

---

## Auth

### Register
```
POST /auth/register/
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "min8chars",
  "preferred_language": "fr"   // optional: "fr" | "ar" | "en", default "fr"
}
```
**201 Created:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "preferred_language": "fr",
    "preferred_currency": "MAD",
    "created_at": "2026-04-13T10:00:00Z"
  },
  "tokens": {
    "access": "<jwt>",
    "refresh": "<jwt>"
  }
}
```
**Errors:** `400` — email already exists, password < 8 chars

---

### Login
```
POST /auth/login/
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```
**200 OK:**
```json
{
  "access": "<jwt>",
  "refresh": "<jwt>",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "preferred_language": "fr",
    "preferred_currency": "MAD",
    "created_at": "2026-04-13T10:00:00Z"
  }
}
```
**Errors:** `401` — invalid credentials

---

### Refresh Token
```
POST /auth/refresh/
```
**Body:**
```json
{ "refresh": "<jwt>" }
```
**200 OK:**
```json
{ "access": "<new_jwt>", "refresh": "<new_jwt>" }
```
Rotation is enabled — old refresh token is blacklisted. Store the new refresh token.

**Errors:** `401` — token invalid or already blacklisted

---

### Logout
```
POST /auth/logout/
```
**Body:**
```json
{ "refresh": "<jwt>" }
```
**205 Reset Content** — no body. Blacklists the refresh token.

**Errors:** `400` — invalid token

---

## Accounts

User accounts (e.g. "Cash", "CIH Bank"). A "Cash" account is created automatically on registration.

**Account object:**
```json
{
  "id": "uuid",
  "name": "CIH",
  "type": "manual",          // "manual" | "synced"
  "currency": "MAD",
  "balance": "5000.00",
  "last_synced_at": null,    // ISO datetime or null
  "created_at": "2026-04-13T10:00:00Z",
  "updated_at": "2026-04-13T10:00:00Z"
}
```

### List Accounts
```
GET /accounts/
```
Returns all accounts for the authenticated user. No pagination (typically < 10 items).

### Create Account
```
POST /accounts/
```
**Body:**
```json
{
  "name": "CIH",
  "type": "manual",    // optional, default "manual"
  "currency": "MAD",   // optional, default "MAD"
  "balance": "5000.00" // optional, default "0.00"
}
```
**201 Created:** Account object

### Get Account
```
GET /accounts/{id}/
```
**404** if not owned by the authenticated user.

### Update Account
```
PATCH /accounts/{id}/
```
All fields optional. Returns updated Account object.

> No DELETE endpoint — accounts are permanent.

---

## Categories

System categories (shared, `is_system: true`) and user-created custom categories.  
The `name` field is localized via `Accept-Language` header.

**Category object:**
```json
{
  "id": "uuid",
  "name": "Alimentation",   // localized to Accept-Language
  "name_fr": "Alimentation",
  "name_ar": "تغذية",
  "name_en": "Groceries",
  "icon": "🛒",
  "is_system": true,
  "is_archived": false
}
```

### List Categories
```
GET /categories/
```
Returns system categories + user's own custom categories. Excludes archived.  
Send `Accept-Language: ar` to get Arabic `name` values.

### Create Custom Category
```
POST /categories/
```
**Body:**
```json
{
  "name_fr": "Voiture",
  "name_ar": "سيارة",
  "name_en": "Car",
  "icon": "🚗"
}
```
**201 Created:** Category object. `user` and `is_system` are set server-side.

### Update Category
```
PATCH /categories/{id}/
```
**Body** (any subset):
```json
{
  "name_fr": "Voiture personnelle",
  "icon": "🚘",
  "is_archived": true
}
```
**403** if trying to modify a system category (`is_system: true`) or another user's category.

---

## Transactions

**Transaction object:**
```json
{
  "id": "uuid",
  "account": "uuid",
  "category": "uuid",
  "type": "expense",        // "income" | "expense" | "bill"
  "amount": "250.00",       // always positive
  "currency": "MAD",
  "date": "2026-04-13",
  "notes": "Carrefour Market",  // nullable
  "is_recurring": false,
  "recurring_bill": null,   // uuid or null
  "external_id": null,      // nullable, for synced transactions
  "source": "manual",       // "manual" | "auto_sync"
  "created_at": "2026-04-13T10:00:00Z",
  "updated_at": "2026-04-13T10:00:00Z"
}
```

### List Transactions
```
GET /transactions/
```
**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `account` | UUID | Filter by account |
| `category` | UUID | Filter by category |
| `type` | string | `income` \| `expense` \| `bill` |
| `date_from` | date | `YYYY-MM-DD` — inclusive |
| `date_to` | date | `YYYY-MM-DD` — inclusive |
| `search` | string | Full-text search on `notes` field |
| `ordering` | string | `date`, `-date`, `amount`, `-amount`, `created_at`, `-created_at` |
| `page` | int | Pagination |
| `page_size` | int | 1–100, default 20 |

Default ordering: `-date, -created_at` (newest first).

### Create Transaction
```
POST /transactions/
```
**Body:**
```json
{
  "account": "uuid",
  "category": "uuid",
  "type": "expense",
  "amount": "250.00",
  "date": "2026-04-13",
  "currency": "MAD",       // optional, default "MAD"
  "notes": "Carrefour",    // optional
  "is_recurring": false,   // optional, default false
  "recurring_bill": null   // optional, uuid of RecurringBill
}
```
**201 Created:** Transaction object

### Get Transaction
```
GET /transactions/{id}/
```

### Update Transaction
```
PUT /transactions/{id}/
PATCH /transactions/{id}/
```

### Delete Transaction
```
DELETE /transactions/{id}/
```
**204 No Content**

### Monthly Summary
```
GET /transactions/summary/
```
**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `month` | string | `YYYY-MM` — defaults to current month |

**200 OK:**
```json
{
  "month": "2026-04",
  "income": "8000.00",
  "expense": "3200.00",
  "bill": "1500.00",
  "net": "3300.00"          // income - expense - bill
}
```

---

## Recurring Bills

Bills that repeat on a schedule. Linking a transaction to a bill is optional via `recurring_bill` field on Transaction.

**RecurringBill object:**
```json
{
  "id": "uuid",
  "category": "uuid",
  "name": "Maroc Telecom",
  "amount": "199.00",
  "frequency": "monthly",   // "weekly" | "monthly" | "yearly"
  "next_due_date": "2026-05-01",
  "is_active": true,
  "created_at": "2026-04-13T10:00:00Z",
  "updated_at": "2026-04-13T10:00:00Z"
}
```

### List Bills
```
GET /bills/
```

### Create Bill
```
POST /bills/
```
**Body:**
```json
{
  "category": "uuid",
  "name": "Maroc Telecom",
  "amount": "199.00",
  "frequency": "monthly",
  "next_due_date": "2026-05-01",
  "is_active": true          // optional, default true
}
```

### Get Bill
```
GET /bills/{id}/
```

### Update Bill
```
PATCH /bills/{id}/
```

### Delete Bill
```
DELETE /bills/{id}/
```
**204 No Content**

---

## Budgets

Monthly spending limits per category. One budget per `(user, category, month)` combination.

**Budget object:**
```json
{
  "id": "uuid",
  "category": "uuid",
  "amount": "2000.00",
  "month": "2026-04-01",    // always first day of the month
  "created_at": "2026-04-13T10:00:00Z",
  "updated_at": "2026-04-13T10:00:00Z"
}
```

> `month` must be sent as `YYYY-MM-01` (first day of month).

### List Budgets
```
GET /budgets/
```
Default ordering: newest month first, then by category name.

### Create Budget
```
POST /budgets/
```
**Body:**
```json
{
  "category": "uuid",
  "amount": "2000.00",
  "month": "2026-04-01"
}
```
**400** if a budget for this category+month already exists.

### Get Budget
```
GET /budgets/{id}/
```

### Update Budget
```
PATCH /budgets/{id}/
```

> No DELETE endpoint.

---

## Insights

AI-generated insights, created weekly by a background job. Read-only except for marking as read.

**AIInsight object:**
```json
{
  "id": "uuid",
  "type": "breakdown",      // "breakdown" | "anomaly" | "awareness"
  "title": "Vous dépensez trop en restaurants",
  "body": "Ce mois-ci vous avez dépensé 1 200 DH en restaurants...",
  "language": "fr",         // "fr" | "ar" | "en"
  "period_start": "2026-04-01",
  "period_end": "2026-04-30",
  "severity": "warning",    // "info" | "warning" | "critical"
  "is_read": false,
  "metadata": {},           // arbitrary JSON, varies by type
  "generated_at": "2026-04-13T07:00:00Z"
}
```

### List Insights
```
GET /insights/
```
**Query params:**
| Param | Type | Description |
|-------|------|-------------|
| `is_read` | boolean | `true` \| `false` |
| `type` | string | `breakdown` \| `anomaly` \| `awareness` |
| `language` | string | `fr` \| `ar` \| `en` |

Default ordering: newest first.

### Get Insight
```
GET /insights/{id}/
```

### Mark as Read
```
PATCH /insights/{id}/
```
**Body:**
```json
{ "is_read": true }
```

### Unread Count
```
GET /insights/unread-count/
```
**200 OK:**
```json
{ "count": 3 }
```

---

## Dashboard

Single aggregated endpoint for the home screen. Returns everything needed in one request.

```
GET /dashboard/
```
**200 OK:**
```json
{
  "accounts": [
    {
      "id": "uuid",
      "name": "Cash",
      "type": "manual",
      "currency": "MAD",
      "balance": "3500.00",
      "last_synced_at": null,
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "recent_transactions": [
    // Last 10 transactions, newest first (same shape as Transaction object)
  ],
  "monthly_summary": {
    "month": "2026-04",
    "income": "8000.00",
    "expense": "3200.00",
    "bill": "1500.00",
    "net": "3300.00"
  },
  "unread_insights_count": 2,
  "budget_progress": [
    {
      "category_id": "uuid",
      "category_name": "Alimentation",  // always French (name_fr)
      "limit": "2000.00",
      "spent": "1200.00",
      "remaining": "800.00"
    }
  ]
}
```
> `budget_progress` only includes budgets set for the current month.  
> `category_name` in budget_progress is always `name_fr` — use category ID to look up localized name from `/categories/` if needed.

---

## Error Responses

All errors follow DRF conventions:

```json
// Validation error (400)
{
  "field_name": ["Error message."],
  "non_field_errors": ["Error message."]
}

// Auth error (401)
{
  "detail": "Given token not valid for any token type",
  "code": "token_not_valid"
}

// Permission error (403)
{
  "detail": "Cannot modify system categories."
}

// Not found (404)
{
  "detail": "No Account matches the given query."
}
```

---

## Token Lifecycle

```
Register/Login → { access (15min), refresh (7 days) }
  ↓
access expires → POST /auth/refresh/ → new { access, refresh }
  ↓
On logout → POST /auth/logout/ with refresh → refresh blacklisted
```

- Store `access` and `refresh` in `expo-secure-store` (never AsyncStorage)
- Intercept 401 responses in Axios to auto-refresh before retrying
- After refresh rotation, always persist the new `refresh` token

---

## System Categories (seed data)

| id (stable after seed) | French | Arabic | English | Icon |
|------------------------|--------|--------|---------|------|
| — | Logement | سكن | Housing | 🏠 |
| — | Alimentation | تغذية | Groceries | 🛒 |
| — | Restaurants & Cafes | مطاعم ومقاهي | Restaurants & Cafes | ☕ |
| — | Transport | نقل | Transport | 🚕 |
| — | Abonnements | اشتراكات | Subscriptions | 📱 |
| — | Sante | صحة | Health | 🏥 |
| — | Shopping | تسوق | Shopping | 🛍️ |
| — | Loisirs | ترفيه | Entertainment | 🎬 |
| — | Factures | فواتير | Bills & Utilities | 💡 |
| — | Education | تعليم | Education | 📚 |
| — | Depenses Pro | مصاريف مهنية | Business Expenses | 💼 |
| — | Soins Personnels | عناية شخصية | Personal Care | 💆 |
| — | Cadeaux | هدايا | Gifts | 🎁 |
| — | Autre | أخرى | Other | 📌 |

> IDs are UUIDs assigned at seed time — fetch them at runtime via `GET /categories/`.
