from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):
    """
    Only allows users with role='admin' in their JWT payload.
    Works with our TokenUser from authentication.py
    """
    message = 'You must be an admin to perform this action.'

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            getattr(request.user, 'role', None) == 'admin'
        )