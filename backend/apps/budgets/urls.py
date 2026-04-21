from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BudgetViewSet, RecurringBudgetViewSet

router = DefaultRouter()
router.register(r"budgets", BudgetViewSet, basename="budget")
router.register(r"recurring-budgets", RecurringBudgetViewSet, basename="recurring-budget")

urlpatterns = [
    path("", include(router.urls)),
]
