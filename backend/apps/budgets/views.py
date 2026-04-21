from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Budget, RecurringBudget
from .serializers import BudgetSerializer, RecurringBudgetSerializer
from .services import ensure_recurring_budgets_for_current_month


class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "patch", "head", "options"]

    def get_queryset(self):
        if self.action == "list":
            ensure_recurring_budgets_for_current_month(self.request.user)
        return Budget.objects.filter(user=self.request.user).prefetch_related("categories")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class RecurringBudgetViewSet(viewsets.ModelViewSet):
    serializer_class = RecurringBudgetSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "patch", "head", "options"]

    def get_queryset(self):
        return RecurringBudget.objects.filter(user=self.request.user).prefetch_related("categories")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
