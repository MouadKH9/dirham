from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db.models import Case, Sum, When, F, Value

from apps.accounts.models import Account
from apps.transactions.models import Transaction


class Command(BaseCommand):
    help = "Recalculate all account balances from their transaction history."

    def handle(self, *args, **options):
        accounts = Account.objects.all()
        updated = 0

        for account in accounts:
            balance = (
                Transaction.objects.filter(account=account)
                .aggregate(
                    total=Sum(
                        Case(
                            When(type=Transaction.TransactionType.INCOME, then=F("amount")),
                            default=-F("amount"),
                            output_field=Transaction._meta.get_field("amount"),
                        )
                    )
                )["total"]
                or Decimal("0.00")
            )

            if account.balance != balance:
                old = account.balance
                account.balance = balance
                account.save(update_fields=["balance"])
                updated += 1
                self.stdout.write(
                    f"  {account.user.email} / {account.name}: {old} -> {balance}"
                )

        self.stdout.write(self.style.SUCCESS(f"Done. Updated {updated}/{accounts.count()} accounts."))
