from datetime import date

from django.core.management.base import BaseCommand, CommandError

from apps.budgets.services import generate_recurring_budgets_for_month, month_start, parse_month


class Command(BaseCommand):
    help = "Generate monthly budget rows from active recurring budget templates."

    def add_arguments(self, parser):
        parser.add_argument(
            "--month",
            type=str,
            default=None,
            help="Target month in YYYY-MM format. Defaults to current month.",
        )

    def handle(self, *args, **options):
        month_arg = options.get("month")
        target_month = month_start(date.today())

        if month_arg:
            try:
                target_month = parse_month(month_arg)
            except Exception as exc:  # pragma: no cover - defensive guard
                raise CommandError("--month must be in YYYY-MM format.") from exc

        result = generate_recurring_budgets_for_month(target_month=target_month)
        self.stdout.write(
            self.style.SUCCESS(
                f"Done for {target_month}: created={result['created']}, skipped={result['skipped']}"
            )
        )
