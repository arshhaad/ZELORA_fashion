from django.db import models
from django.conf import settings
from django.utils import timezone
import random


class PlatformSetting(models.Model):
    site_name = models.CharField(max_length=200, default='ZELORA Luxury Fashion')
    support_email = models.EmailField(default='concierge@zelora.luxury')
    currency = models.CharField(max_length=10, default='USD')
    currency_symbol = models.CharField(max_length=5, default='$')
    default_commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=12.50)
    maintenance_mode = models.BooleanField(default=False)
    allow_seller_registration = models.BooleanField(default=True)
    auto_approve_products = models.BooleanField(default=False)
    razorpay_key_id = models.CharField(max_length=100, blank=True, default='rzp_test_SjAwiMI1HJLHsn')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Platform Setting'
        verbose_name_plural = 'Platform Settings'

    def __str__(self):
        return f"{self.site_name} Configuration"

    @classmethod
    def get_settings(cls):
        obj, _ = cls.objects.get_or_create(id=1)
        return obj


class PlatformBanner(models.Model):
    title = models.CharField(max_length=255)
    subtitle = models.CharField(max_length=500, blank=True)
    cta_text = models.CharField(max_length=100, default='Shop Collection')
    cta_link = models.CharField(max_length=500, default='/products')
    image_url = models.URLField(max_length=1000)
    position = models.CharField(max_length=50, default='hero')  # hero, promo_top, mid_section
    display_order = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['display_order', '-created_at']

    def __str__(self):
        return f"{self.title} ({self.position})"


class PlatformCoupon(models.Model):
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    discount_type = models.CharField(max_length=20, default='percentage')  # percentage, fixed
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    min_purchase = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    max_discount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    usage_limit = models.PositiveIntegerField(default=1000)
    used_count = models.PositiveIntegerField(default=0)
    valid_from = models.DateTimeField(default=timezone.now)
    valid_until = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.code} - {self.discount_value}{'%' if self.discount_type == 'percentage' else '$'}"


class PlatformReview(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='admin_reviews')
    product_name = models.CharField(max_length=255)
    shop_name = models.CharField(max_length=255, default='ZELORA Atelier')
    rating = models.PositiveSmallIntegerField(default=5)
    title = models.CharField(max_length=255, blank=True)
    comment = models.TextField()
    status = models.CharField(max_length=20, default='approved')  # approved, pending, rejected, flagged
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.product_name} ({self.rating}★)"


class SupportTicket(models.Model):
    ticket_number = models.CharField(max_length=20, unique=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='support_tickets')
    user_type = models.CharField(max_length=20, default='customer')  # customer, seller
    subject = models.CharField(max_length=255)
    category = models.CharField(max_length=50, default='order')  # order, payment, payout, product, account, other
    priority = models.CharField(max_length=20, default='medium')  # low, medium, high, urgent
    status = models.CharField(max_length=20, default='open')  # open, in_progress, resolved, closed
    message = models.TextField()
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.ticket_number:
            self.ticket_number = f"TKT-{random.randint(10000, 99999)}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.ticket_number}] {self.subject} ({self.status})"


class SupportTicketReply(models.Model):
    ticket = models.ForeignKey(SupportTicket, on_delete=models.CASCADE, related_name='replies')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    message = models.TextField()
    is_admin_reply = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']


class SellerPayoutRequest(models.Model):
    shop_name = models.CharField(max_length=255)
    owner_email = models.EmailField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=50, default='bank_transfer')
    account_details = models.JSONField(default=dict)
    status = models.CharField(max_length=20, default='pending')  # pending, approved, processing, completed, rejected
    transaction_reference = models.CharField(max_length=100, blank=True)
    admin_notes = models.TextField(blank=True)
    requested_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-requested_at']

    def __str__(self):
        return f"{self.shop_name} - ${self.amount} ({self.status})"


class AdminBroadcastNotification(models.Model):
    title = models.CharField(max_length=255)
    message = models.TextField()
    target_audience = models.CharField(max_length=50, default='all')  # all, customers, sellers
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-sent_at']

    def __str__(self):
        return f"{self.title} to {self.target_audience}"
