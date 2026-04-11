import django_filters
from .models import Transaction


class TransactionFilter(django_filters.FilterSet):
    date_from = django_filters.DateFilter(field_name="date", lookup_expr="gte")
    date_to = django_filters.DateFilter(field_name="date", lookup_expr="lte")
    account = django_filters.UUIDFilter(field_name="account__id")
    category = django_filters.UUIDFilter(field_name="category__id")
    type = django_filters.ChoiceFilter(choices=Transaction.TransactionType.choices)

    class Meta:
        model = Transaction
        fields = ["account", "category", "type", "date_from", "date_to"]
