"""
Seed a realistic demo account with 2 weeks of Moroccan spending data.

Usage:
    python manage.py seed_demo
    python manage.py seed_demo --email demo@dirham.ma --password Demo1234!
    python manage.py seed_demo --flush   # delete and recreate the demo user
"""

import random
from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.accounts.models import Account
from apps.categories.models import Category
from apps.transactions.models import RecurringBill, Transaction

User = get_user_model()

DEMO_EMAIL = "demo@dirham.ma"
DEMO_PASSWORD = "Demo1234!"

# ---------------------------------------------------------------------------
# Seed data
# ---------------------------------------------------------------------------

RECURRING_BILLS = [
    {"name": "Inwi (forfait)",   "amount": "149.00", "category": "Abonnements",    "frequency": "monthly"},
    {"name": "Loyer",            "amount": "3200.00","category": "Logement",        "frequency": "monthly"},
    {"name": "ONEE Eau",         "amount": "95.00",  "category": "Factures",        "frequency": "monthly"},
    {"name": "ONEE Électricité", "amount": "210.00", "category": "Factures",        "frequency": "monthly"},
]

# Each entry: (category_fr, type, amount_range, notes_pool)
TRANSACTION_TEMPLATES = [
    ("Alimentation",       "expense", (35, 180),  ["Marjane", "Carrefour", "Acima", "Épicerie quartier", "Boucherie"]),
    ("Restaurants & Cafés","expense", (15, 95),   ["Café Atlas", "Sandwicherie", "Pizza", "Déjeuner resto", "Café du matin"]),
    ("Transport",          "expense", (7,  45),   ["Taxi", "Bus", "Carburant", "Parking", "JAWAZ"]),
    ("Abonnements",        "expense", (149,149),  ["Inwi forfait"]),
    ("Santé",              "expense", (50, 350),  ["Pharmacie", "Médecin", "Analyses"]),
    ("Shopping",           "expense", (90, 600),  ["Zara", "Vêtements souk", "Accessoires", "Chaussures"]),
    ("Loisirs",            "expense", (50, 200),  ["Cinéma", "Sport", "Sortie", "Concert"]),
    ("Factures",           "expense", (95, 210),  ["ONEE Eau", "ONEE Électricité"]),
    ("Soins Personnels",   "expense", (30, 180),  ["Coiffeur", "Hammam", "Cosmétiques"]),
    ("Cadeaux",            "expense", (80, 300),  ["Cadeau anniversaire", "Mariage ami", "Cadeau famille"]),
]

# Realistic 14-day schedule: list of (day_offset, category_fr, type, fixed_amount_or_None, note)
# day 0 = 14 days ago, day 13 = yesterday
FIXED_EVENTS = [
    # Salary on day 0 — goes to bank
    (0,  None,               "income",  "12500.00", "Salaire Juin"),
    # Cash withdrawal on day 0 — funds the cash wallet
    (0,  "Autre",            "income",  "1500.00",  "Retrait espèces"),
    # Rent on day 1
    (1,  "Logement",         "expense", "3200.00",  "Loyer"),
    # Utilities on day 2
    (2,  "Factures",         "expense", "210.00",   "ONEE Électricité"),
    (2,  "Factures",         "expense", "95.00",    "ONEE Eau"),
    # Phone bill on day 3
    (3,  "Abonnements",      "expense", "149.00",   "Inwi forfait"),
    # Freelance income on day 7 — goes to bank
    (7,  None,               "income",  "2800.00",  "Mission freelance"),
    # Mid-week cash top-up on day 7
    (7,  "Autre",            "income",  "800.00",   "Retrait espèces"),
]


class Command(BaseCommand):
    help = "Seed a demo user with 2 weeks of realistic Moroccan finance data"

    def add_arguments(self, parser):
        parser.add_argument("--email",    default=DEMO_EMAIL,    help="Demo user email")
        parser.add_argument("--password", default=DEMO_PASSWORD, help="Demo user password")
        parser.add_argument(
            "--flush",
            action="store_true",
            help="Delete existing demo user and recreate from scratch",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        email    = options["email"]
        password = options["password"]
        flush    = options["flush"]

        # ------------------------------------------------------------------ #
        # 1. User
        # ------------------------------------------------------------------ #
        if flush:
            User.objects.filter(email=email).delete()
            self.stdout.write(self.style.WARNING(f"Deleted existing user: {email}"))

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "preferred_language": "fr",
                "preferred_currency": "MAD",
                # Pre-enable AI insights for demo accounts so App Store
                # reviewers can verify the feature without going through
                # the consent flow themselves.
                "ai_insights_enabled": True,
            },
        )
        if created:
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f"Created user: {email}"))
        else:
            self.stdout.write(self.style.WARNING(f"User already exists: {email} — skipping seed"))
            self._print_creds(email, password)
            return

        # ------------------------------------------------------------------ #
        # 2. Accounts
        # ------------------------------------------------------------------ #
        cash = Account.objects.create(
            user=user, name="Cash", type="manual", currency="MAD", balance=Decimal("0"),
        )
        bank = Account.objects.create(
            user=user, name="CIH Bank", type="manual", currency="MAD", balance=Decimal("0"),
        )

        # ------------------------------------------------------------------ #
        # 3. Categories — ensure system categories exist
        # ------------------------------------------------------------------ #
        self._ensure_system_categories()
        categories = {c.name_fr: c for c in Category.objects.filter(is_system=True)}

        # "Autre" fallback for income transactions
        other_cat = categories.get("Autre")
        if other_cat is None:
            other_cat = Category.objects.filter(is_system=True).first()

        # ------------------------------------------------------------------ #
        # 4. Recurring bills
        # ------------------------------------------------------------------ #
        today = date.today()
        for bill_data in RECURRING_BILLS:
            cat = categories.get(bill_data["category"], other_cat)
            RecurringBill.objects.create(
                user=user,
                category=cat,
                name=bill_data["name"],
                amount=Decimal(bill_data["amount"]),
                frequency=bill_data["frequency"],
                next_due_date=today.replace(day=1) + timedelta(days=32),  # next month 1st
                is_active=True,
            )

        # ------------------------------------------------------------------ #
        # 5. Transactions — fixed events
        # ------------------------------------------------------------------ #
        start = today - timedelta(days=14)
        transactions = []

        for day_offset, cat_fr, tx_type, amount, note in FIXED_EVENTS:
            tx_date = start + timedelta(days=day_offset)
            cat = categories.get(cat_fr, other_cat) if cat_fr else other_cat
            # Cash top-ups and cash-specific categories go to the cash account
            is_cash_event = "espèces" in note or "Retrait" in note
            if tx_type == "income":
                account = cash if is_cash_event else bank
            else:
                account = cash if random.random() < 0.4 else bank
            transactions.append(Transaction(
                user=user, account=account, category=cat,
                type=tx_type, amount=Decimal(amount), currency="MAD",
                date=tx_date, notes=note, source="manual",
            ))

        # ------------------------------------------------------------------ #
        # 6. Transactions — random daily spending
        # ------------------------------------------------------------------ #
        # Distribute ~28 organic transactions across 14 days
        random.seed(42)  # reproducible
        for day_offset in range(14):
            tx_date = start + timedelta(days=day_offset)
            # 1-3 random expenses per day
            n = random.randint(1, 3)
            for _ in range(n):
                cat_fr, tx_type, amount_range, notes_pool = random.choice(TRANSACTION_TEMPLATES)
                # Skip if this category was already covered by a fixed event today
                if cat_fr in ("Logement", "Factures", "Abonnements") and day_offset in (1, 2, 3):
                    continue
                cat = categories.get(cat_fr, other_cat)
                amount = Decimal(str(random.randint(*amount_range)))
                note   = random.choice(notes_pool)
                account = cash if cat_fr in ("Restaurants & Cafés", "Transport", "Alimentation") else bank
                transactions.append(Transaction(
                    user=user, account=account, category=cat,
                    type=tx_type, amount=amount, currency="MAD",
                    date=tx_date, notes=note, source="manual",
                ))

        Transaction.objects.bulk_create(transactions)

        # ------------------------------------------------------------------ #
        # 7. Recalculate account balances from transactions
        # ------------------------------------------------------------------ #
        for account in [cash, bank]:
            income  = sum(
                t.amount for t in transactions if t.account_id == account.pk and t.type == "income"
            )
            expense = sum(
                t.amount for t in transactions if t.account_id == account.pk and t.type in ("expense", "bill")
            )
            account.balance = income - expense
            account.save()

        # ------------------------------------------------------------------ #
        # 8. Summary
        # ------------------------------------------------------------------ #
        tx_count = len(transactions)
        self.stdout.write(self.style.SUCCESS(
            f"\n✓ Seeded {tx_count} transactions across 14 days\n"
            f"  Cash balance : {cash.balance} MAD\n"
            f"  CIH balance  : {bank.balance} MAD\n"
        ))
        self._print_creds(email, password)

    # ---------------------------------------------------------------------- #
    # Helpers
    # ---------------------------------------------------------------------- #

    def _print_creds(self, email, password):
        self.stdout.write("\n" + "=" * 40)
        self.stdout.write(self.style.SUCCESS("  Demo login credentials"))
        self.stdout.write("=" * 40)
        self.stdout.write(f"  Email    : {email}")
        self.stdout.write(f"  Password : {password}")
        self.stdout.write("=" * 40 + "\n")

    def _ensure_system_categories(self):
        """Run seed_categories inline if no system categories exist yet."""
        if not Category.objects.filter(is_system=True).exists():
            self.stdout.write("No system categories found — seeding categories first...")
            from django.core.management import call_command
            call_command("seed_categories", verbosity=0)
