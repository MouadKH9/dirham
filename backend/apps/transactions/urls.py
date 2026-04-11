from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransactionViewSet, RecurringBillViewSet

router = DefaultRouter()
router.register(r"transactions", TransactionViewSet, basename="transaction")
router.register(r"bills", RecurringBillViewSet, basename="bill")

urlpatterns = [
    path("", include(router.urls)),
]
