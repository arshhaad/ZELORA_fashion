from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, EmailVerificationCode, PasswordResetCode


@admin.register(User)
class CustomUserAdmin(BaseUserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'is_email_verified', 'auth_provider', 'is_staff')
    list_filter = ('is_email_verified', 'auth_provider', 'is_staff', 'is_superuser')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'avatar_url')}),
        ('Status', {'fields': ('is_email_verified', 'auth_provider', 'is_active', 'is_staff', 'is_superuser')}),
        ('Permissions', {'fields': ('groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )


@admin.register(EmailVerificationCode)
class EmailVerificationCodeAdmin(admin.ModelAdmin):
    list_display = ('user', 'code', 'expires_at', 'is_used', 'created_at')
    list_filter = ('is_used', 'created_at')
    search_fields = ('user__email', 'code')


@admin.register(PasswordResetCode)
class PasswordResetCodeAdmin(admin.ModelAdmin):
    list_display = ('user', 'code', 'expires_at', 'is_used', 'created_at')
    list_filter = ('is_used', 'created_at')
    search_fields = ('user__email', 'code')
