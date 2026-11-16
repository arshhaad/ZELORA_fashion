"""
URL configuration for CUSTOMER project.
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.core.cache import cache
from django.db import connection

def health_check(request):
    data = {"status": "ok", "service": "ZELORA API", "database": "unknown", "redis": "unknown"}
    try:
        connection.ensure_connection()
        data["database"] = "connected"
    except Exception as e:
        data["database"] = f"error: {str(e)}"
        data["status"] = "degraded"

    try:
        cache.set("_health_check", 1, timeout=5)
        if cache.get("_health_check") == 1:
            data["redis"] = "connected"
        else:
            data["redis"] = "fallback"
    except Exception as e:
        data["redis"] = f"error: {str(e)}"

    http_code = 200 if data["status"] == "ok" else 503
    return JsonResponse(data, status=http_code)

urlpatterns = [
    path('api/health/', health_check, name='health-check'),
    path('django-admin/', admin.site.urls),
    path('api/auth/', include('CUSTOMER.urls')),
    path('api/admin/', include('ADMIN.urls')),
    path('api/ai/', include('ai_assistant.urls')),
]
