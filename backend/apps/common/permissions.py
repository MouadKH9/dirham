from rest_framework.permissions import BasePermission


class IsOwner(BasePermission):
    """Object-level permission: obj.user must match request.user."""

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user
