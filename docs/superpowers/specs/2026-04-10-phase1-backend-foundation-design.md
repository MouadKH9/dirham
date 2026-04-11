# Phase 1 — Backend Foundation Design

**Date:** 2026-04-10
**Status:** Approved
**Scope:** Django project scaffolding, User/Account/Category/Transaction models, JWT auth, category seeding, transaction filters + summary

---

## Project Structure

```
backend/
├── manage.py
├── .env.example
├── requirements/
│   ├── base.txt          # Django 5.x, DRF, SimpleJWT, django-filter, python-decouple, psycopg2-binary
│   ├── dev.txt           # pytest, pytest-django, factory-boy
│   └── prod.txt          # gunicorn, dj-database-url
├── config/
│   ├── __init__.py
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── dev.py
│   │   └── prod.py
│   ├── urls.py
│   └── wsgi.py
├── apps/
│   ├── __init__.py
│   ├── common/
│   │   ├── __init__.py
│   │   ├── models.py          # TimeStampedModel abstract base
│   │   ├── pagination.py      # StandardPagination
│   │   └── permissions.py     # IsOwner
│   ├── accounts/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── managers.py        # CustomUserManager
│   │   ├── models.py          # User, Account
│   │   ├── serializers.py
│   │   ├── signals.py         # post_save → default Cash account
│   │   ├── urls.py
│   │   ├── views.py
│   │   └── tests/
│   │       ├── __init__.py
│   │       ├── factories.py
│   │       ├── test_models.py
│   │       ├── test_views.py
│   │       └── test_signals.py
│   ├── categories/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   ├── views.py
│   │   ├── management/
│   │   │   └── commands/
│   │   │       └── seed_categories.py
│   │   └── tests/
│   │       ├── __init__.py
│   │       ├── factories.py
│   │       ├── test_models.py
│   │       ├── test_views.py
│   │       └── test_seed_categories.py
│   └── transactions/
│       ├── __init__.py
│       ├── admin.py
│       ├── apps.py
│       ├── models.py
│       ├── serializers.py
│       ├── urls.py
│       ├── views.py
│       ├── filters.py
│       └── tests/
│           ├── __init__.py
│           ├── factories.py
│           ├── test_models.py
│           ├── test_views.py
│           └── test_filters.py
├── conftest.py
└── pytest.ini
```

**Key decisions:**
- `config/` as Django project name (avoids confusion with repo-root `dirham/`)
- `apps/` directory groups all Django apps
- `apps/common/` for shared abstractions (base model, pagination, permissions)
- python-decouple for env vars
- Settings split: base/dev/prod — Railway sets `DJANGO_SETTINGS_MODULE=config.settings.prod`

---

## Dependencies

### base.txt
```
Django>=5.0,<6.0
djangorestframework>=3.15,<4.0
djangorestframework-simplejwt>=5.3,<6.0
django-filter>=24.0
python-decouple>=3.8
psycopg2-binary>=2.9
dj-database-url>=2.0
```

### dev.txt
```
-r base.txt
pytest>=8.0
pytest-django>=4.8
factory-boy>=3.3
```

### prod.txt
```
-r base.txt
gunicorn>=21.0
```

---

## Shared Abstractions

### TimeStampedModel (`apps/common/models.py`)

Abstract base for all models. Provides:
- `id`: UUIDField (PK, default=uuid4)
- `created_at`: DateTimeField (auto_now_add)
- `updated_at`: DateTimeField (auto_now)

### StandardPagination (`apps/common/pagination.py`)

PageNumberPagination: page_size=20, max=100, configurable via `?page_size=` param.

### IsOwner (`apps/common/permissions.py`)

Object-level DRF permission: `obj.user == request.user`.

---

## Models

### User (`apps/accounts/models.py`)

Extends `AbstractBaseUser` + `PermissionsMixin`. Does NOT inherit TimeStampedModel (incompatible base).

| Field | Type | Notes |
|-------|------|-------|
| id | UUID PK | default=uuid4 |
| email | EmailField | unique, USERNAME_FIELD |
| password | — | via AbstractBaseUser |
| preferred_language | CharField(2) | choices: fr/ar/en, default "fr" |
| preferred_currency | CharField(3) | default "MAD" |
| is_active | BooleanField | default True |
| is_staff | BooleanField | default False |
| created_at | DateTimeField | auto_now_add |
| updated_at | DateTimeField | auto_now |

Custom `UserManager` in `managers.py`:
- `create_user(email, password, **extra)` — normalizes email, hashes password
- `create_superuser(email, password, **extra)` — sets is_staff=True, is_superuser=True

No username field. `REQUIRED_FIELDS = []`.

### Account (`apps/accounts/models.py`)

Inherits `TimeStampedModel`.

| Field | Type | Notes |
|-------|------|-------|
| user | FK → User | CASCADE, related_name="accounts" |
| name | CharField(100) | e.g. "CIH", "Cash" |
| type | CharField(10) | choices: manual/synced, default "manual" |
| currency | CharField(3) | default "MAD" |
| balance | DecimalField(12,2) | default 0 |
| last_synced_at | DateTimeField | nullable |

Ordering: `-created_at`.

### Category (`apps/categories/models.py`)

Inherits `TimeStampedModel`.

| Field | Type | Notes |
|-------|------|-------|
| user | FK → User | nullable (NULL = system category), CASCADE |
| name_fr | CharField(100) | French name |
| name_ar | CharField(100) | Arabic name |
| name_en | CharField(100) | English name |
| icon | CharField(10) | emoji |
| is_system | BooleanField | default False |
| is_archived | BooleanField | default False |

System categories (user=NULL) are shared across all users. Custom categories have user FK set.

### Transaction (`apps/transactions/models.py`)

Inherits `TimeStampedModel`.

| Field | Type | Notes |
|-------|------|-------|
| user | FK → User | CASCADE |
| account | FK → Account | CASCADE |
| category | FK → Category | PROTECT |
| type | CharField(10) | choices: income/expense/bill |
| amount | DecimalField(12,2) | always positive |
| currency | CharField(3) | default "MAD" |
| date | DateField | |
| notes | TextField | blank, nullable |
| is_recurring | BooleanField | default False |
| external_id | CharField(255) | nullable |
| source | CharField(10) | choices: manual/auto_sync, default "manual" |

`recurring_bill` FK **omitted in Phase 1**. Added via migration in Phase 2.

Ordering: `-date`, `-created_at`.

---

## Auth Flow

### POST /api/v1/auth/register/

Input: `{email, password, preferred_language?}`
- Validates email uniqueness (case-insensitive), password min length 8
- Creates User via `UserManager.create_user()`
- Signal auto-creates default "Cash" account (inherits user's preferred_currency)
- Returns 201: `{user: {...}, tokens: {access, refresh}}`

### POST /api/v1/auth/login/

Extends SimpleJWT's `TokenObtainPairView`. Custom serializer adds user data to response.
- Returns 200: `{access, refresh, user: {...}}`

### POST /api/v1/auth/refresh/

SimpleJWT's `TokenRefreshView` directly. Rotation enabled, old token blacklisted.

### POST /api/v1/auth/logout/

Accepts `{refresh}`, blacklists the token. Returns 205.

### Default Cash Account (signal)

`post_save` on User model. On `created=True`:
- Creates `Account(user=instance, name="Cash", type="manual", currency=instance.preferred_currency)`

---

## API Endpoints

All under `/api/v1/`.

### Accounts
| Method | Path | Description |
|--------|------|-------------|
| GET | /accounts/ | List user's accounts |
| POST | /accounts/ | Create account |
| GET | /accounts/{id}/ | Account detail |
| PATCH | /accounts/{id}/ | Update account |

No DELETE (per spec).

### Categories
| Method | Path | Description |
|--------|------|-------------|
| GET | /categories/ | System (user=NULL) + user's custom. Filtered: not archived. |
| POST | /categories/ | Create custom category (sets user=request.user) |
| PATCH | /categories/{id}/ | Rename/archive (own categories only, not system) |

**Accept-Language handling:** Django's `LocaleMiddleware` sets `request.LANGUAGE_CODE`. The serializer has a `get_name()` method returning `name_{lang}`.

### Transactions
| Method | Path | Description |
|--------|------|-------------|
| GET | /transactions/ | List with filters |
| POST | /transactions/ | Create |
| GET | /transactions/{id}/ | Detail |
| PUT | /transactions/{id}/ | Full update |
| PATCH | /transactions/{id}/ | Partial update |
| DELETE | /transactions/{id}/ | Delete |
| GET | /transactions/summary/ | Monthly aggregation |

**Filters** (django-filter):
- `?account=` — UUID
- `?category=` — UUID
- `?type=` — income/expense/bill
- `?date_from=` — date (gte)
- `?date_to=` — date (lte)
- `?search=` — DRF SearchFilter on `notes` field

**Summary endpoint:** `?month=YYYY-MM` (defaults to current month). Uses `.values("type").annotate(total=Sum("amount"))` — single SQL GROUP BY. Returns `{income, expense, bill, net, month}`.

---

## Category Seeding

Management command: `python manage.py seed_categories`

Idempotent via `update_or_create` keyed on `(name_en, is_system=True)`.

14 predefined categories:
| French | Arabic | English | Icon |
|--------|--------|---------|------|
| Logement | سكن | Housing | 🏠 |
| Alimentation | تغذية | Groceries | 🛒 |
| Restaurants & Cafes | مطاعم ومقاهي | Restaurants & Cafes | ☕ |
| Transport | نقل | Transport | 🚕 |
| Abonnements | اشتراكات | Subscriptions | 📱 |
| Sante | صحة | Health | 🏥 |
| Shopping | تسوق | Shopping | 🛍️ |
| Loisirs | ترفيه | Entertainment | 🎬 |
| Factures | فواتير | Bills & Utilities | 💡 |
| Education | تعليم | Education | 📚 |
| Depenses Pro | مصاريف مهنية | Business Expenses | 💼 |
| Soins Personnels | عناية شخصية | Personal Care | 💆 |
| Cadeaux | هدايا | Gifts | 🎁 |
| Autre | أخرى | Other | 📌 |

---

## Settings Configuration

### base.py highlights
```python
AUTH_USER_MODEL = "accounts.User"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": ["rest_framework_simplejwt.authentication.JWTAuthentication"],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"],
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_PAGINATION_CLASS": "apps.common.pagination.StandardPagination",
    "PAGE_SIZE": 20,
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
}
```

### dev.py
- DEBUG=True, ALLOWED_HOSTS=["*"]
- Same PostgreSQL database config (reads from .env)

### prod.py
- DEBUG=False, SECURE_SSL_REDIRECT=True, HSTS enabled
- `dj-database-url` for Railway's DATABASE_URL

---

## Test Strategy

### Factories (factory_boy)
- `UserFactory` — email sequence, password via PostGenerationMethodCall
- `AccountFactory` — SubFactory(UserFactory)
- `CategoryFactory` — trilingual names with sequences
- `TransactionFactory` — wires user/account/category consistently

### Shared fixtures (conftest.py)
- `api_client` — plain APIClient
- `user` — UserFactory instance
- `authenticated_client` — APIClient with force_authenticate

### Test coverage

**Models:** User creation, manager methods, str representations, UUID auto-generation, ordering.

**Signals:** User creation triggers Cash account; Cash account inherits preferred_currency.

**Auth endpoints:** Register (success, duplicate email, weak password), login (success, wrong password), refresh (valid, blacklisted), logout (blacklists token).

**Accounts:** CRUD operations, ownership isolation (404 for other user's accounts).

**Categories:** List returns system + own custom, excludes other users', respects Accept-Language, create sets user FK, cannot PATCH system categories.

**Transactions:** Full CRUD, ownership isolation, all filter combinations, search on notes, summary aggregation with month param.

**Seed command:** Creates 14 categories, idempotent on re-run.

---

## Implementation Order

1. **Scaffolding** — Django project, directory structure, dependencies, settings, pytest config
2. **User + Auth** — Tests → model/manager → migrations → auth endpoints → Cash account signal
3. **Accounts CRUD** — Tests → serializer/views → ownership enforcement
4. **Categories** — Tests → model/views → seed command
5. **Transactions** — Tests → CRUD → filters → summary endpoint
6. **Polish** — Admin registrations, `manage.py check --deploy`

---

## Verification

1. `pytest` — all tests pass
2. `python manage.py seed_categories` — creates 14 categories
3. `python manage.py runserver` — server starts, endpoints respond
4. Manual smoke test: register → login → create account → create transaction → list with filters → get summary
5. `python manage.py check --deploy` — no critical warnings
