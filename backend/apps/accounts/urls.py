from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LoginView, LogoutView, AccountListCreateView, AccountDetailView

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("accounts/", AccountListCreateView.as_view(), name="account-list"),
    path("accounts/<uuid:pk>/", AccountDetailView.as_view(), name="account-detail"),
]
