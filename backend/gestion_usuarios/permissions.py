from rest_framework import permissions

class IsAdminRol(permissions.BasePermission):
    """
    Permite acceso solo a usuarios con rol 'ADMIN'.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.rol and request.user.rol.codigo == 'ADMIN')
