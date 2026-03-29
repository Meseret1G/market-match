from rest_framework import permissions

class IsClient(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_client)

class IsFreelancer(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_freelancer)

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        # Profile owner Check
        if hasattr(obj, 'user'):
            return obj.user == request.user
        # Job/Application owner check
        if hasattr(obj, 'client'):
            return obj.client == request.user
        if hasattr(obj, 'freelancer'):
            return obj.freelancer.user == request.user
        return False
