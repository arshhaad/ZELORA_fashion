"""
URL configuration for CUSTOMER project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('django-admin/', admin.site.urls),
    path('api/auth/', include('CUSTOMER.urls')),
    path('api/admin/', include('ADMIN.urls')),
]
