from rest_framework import permissions


class IsAuthenticatedZeloraUser(permissions.BasePermission):
    """
    Allows access only to authenticated users verified via JWT.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)


class IsAdminUserOrStaff(permissions.BasePermission):
    """
    Allows access only to verified platform staff or superusers.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser))


class IsSellerUser(permissions.BasePermission):
    """
    Allows access only to verified boutique seller accounts.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_seller)
