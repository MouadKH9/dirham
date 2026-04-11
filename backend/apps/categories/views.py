from django.db import models
from rest_framework import mixins, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from .models import Category
from .serializers import CategorySerializer, CategoryCreateSerializer


class CategoryViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "patch", "head", "options"]

    def get_queryset(self):
        return Category.objects.filter(
            models.Q(user__isnull=True) | models.Q(user=self.request.user)
        ).filter(is_archived=False)

    def get_serializer_class(self):
        if self.action == "create":
            return CategoryCreateSerializer
        return CategorySerializer

    def perform_update(self, serializer):
        instance = serializer.instance
        if instance.is_system:
            raise PermissionDenied("Cannot modify system categories.")
        if instance.user != self.request.user:
            raise PermissionDenied("Cannot modify another user's category.")
        serializer.save()
