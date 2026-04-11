from datetime import date, timedelta
from decimal import Decimal
from django.db.models import Sum
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Transaction, RecurringBill
from .serializers import TransactionSerializer, RecurringBillSerializer
from .filters import TransactionFilter


class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    filterset_class = TransactionFilter
    search_fields = ["notes"]
    ordering_fields = ["date", "amount", "created_at"]
    ordering = ["-date", "-created_at"]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["get"])
    def summary(self, request):
        month_str = request.query_params.get("month")
        if month_str:
            try:
                year, month = month_str.split("-")
                start_date = date(int(year), int(month), 1)
            except (ValueError, TypeError, AttributeError):
                return Response(
                    {"error": "Invalid month format. Use YYYY-MM."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            today = date.today()
            start_date = today.replace(day=1)

        if start_date.month == 12:
            end_date = date(start_date.year + 1, 1, 1) - timedelta(days=1)
        else:
            end_date = date(start_date.year, start_date.month + 1, 1) - timedelta(days=1)

        qs = self.get_queryset().filter(date__gte=start_date, date__lte=end_date)
        aggregation = qs.values("type").annotate(total=Sum("amount"))

        result = {
            "income": Decimal("0.00"),
            "expense": Decimal("0.00"),
            "bill": Decimal("0.00"),
        }
        for row in aggregation:
            result[row["type"]] = row["total"]

        result["net"] = result["income"] - result["expense"] - result["bill"]
        result["month"] = start_date.strftime("%Y-%m")

        return Response(result)


class RecurringBillViewSet(viewsets.ModelViewSet):
    serializer_class = RecurringBillSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_queryset(self):
        return RecurringBill.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
