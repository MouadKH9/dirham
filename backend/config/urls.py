from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include("apps.accounts.urls")),
    path("api/v1/", include("apps.categories.urls")),
    path("api/v1/", include("apps.transactions.urls")),
    path("api/v1/", include("apps.budgets.urls")),
    path("api/v1/", include("apps.dashboard.urls")),
    path("api/v1/", include("apps.insights.urls")),
]
