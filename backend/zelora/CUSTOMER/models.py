from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone
import random


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email address is required')
        email = self.normalize_email(email)
        extra_fields.setdefault('username', email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_email_verified', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    username = models.CharField(max_length=150, blank=True, null=True, unique=False)
    email = models.EmailField(unique=True)
    is_email_verified = models.BooleanField(default=False)
    auth_provider = models.CharField(max_length=50, default='email')  # 'email', 'google'
    avatar_url = models.URLField(max_length=1000, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    gender = models.CharField(max_length=20, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    is_seller = models.BooleanField(default=False)
    shop_name = models.CharField(max_length=255, blank=True, null=True)
    shop_category = models.CharField(max_length=150, blank=True, null=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email


class EmailVerificationCode(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='verification_codes')
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    @classmethod
    def generate(cls, user, validity_minutes=15):
        cls.objects.filter(user=user, is_used=False).update(is_used=True)
        code = f"{random.randint(100000, 999999)}"
        expires_at = timezone.now() + timezone.timedelta(minutes=validity_minutes)
        return cls.objects.create(user=user, code=code, expires_at=expires_at)

    def is_valid(self):
        return not self.is_used and self.expires_at > timezone.now()

    def __str__(self):
        return f"Verify code for {self.user.email}: {self.code}"


class PasswordResetCode(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_codes')
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    @classmethod
    def generate(cls, user, validity_minutes=15):
        cls.objects.filter(user=user, is_used=False).update(is_used=True)
        code = f"{random.randint(100000, 999999)}"
        expires_at = timezone.now() + timezone.timedelta(minutes=validity_minutes)
        return cls.objects.create(user=user, code=code, expires_at=expires_at)

    def is_valid(self):
        return not self.is_used and self.expires_at > timezone.now()

    def __str__(self):
        return f"Reset code for {self.user.email}: {self.code}"


class SellerVerificationCode(models.Model):
    email = models.EmailField(db_index=True)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    @classmethod
    def generate(cls, email, validity_minutes=15):
        clean_email = email.lower().strip()
        cls.objects.filter(email=clean_email, is_used=False).update(is_used=True)
        code = f"{random.randint(100000, 999999)}"
        expires_at = timezone.now() + timezone.timedelta(minutes=validity_minutes)
        return cls.objects.create(email=clean_email, code=code, expires_at=expires_at)

    def is_valid(self):
        return not self.is_used and self.expires_at > timezone.now()

    def __str__(self):
        return f"Seller OTP for {self.email}: {self.code}"


class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    full_name = models.CharField(max_length=150)
    mobile_number = models.CharField(max_length=20)
    house_building = models.CharField(max_length=255)
    street_area = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pin_code = models.CharField(max_length=20)
    address_type = models.CharField(max_length=20, default='Home')  # Home, Work, Other
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_default', '-created_at']

    def __str__(self):
        return f"{self.full_name} - {self.city} ({self.address_type})"


class Order(models.Model):
    STATUS_CHOICES = [
        ('Processing', 'Processing'),
        ('Confirmed', 'Confirmed'),
        ('Shipped', 'Shipped'),
        ('Out for Delivery', 'Out for Delivery'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
        ('Returned', 'Returned'),
    ]

    order_id = models.CharField(max_length=50, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Processing')
    status_updated_at = models.DateTimeField(auto_now=True)
    estimated_delivery = models.CharField(max_length=100, default='3 - 5 Business Days')
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    delivery_charges = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    payment_method = models.CharField(max_length=50, default='UPI')
    payment_status = models.CharField(max_length=30, default='Paid')
    delivery_method = models.CharField(max_length=50, default='Standard Delivery')
    shipping_address = models.JSONField(default=dict)
    tracking_number = models.CharField(max_length=100, blank=True, null=True)
    razorpay_order_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_signature = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order {self.order_id} ({self.status}) - {self.user.email}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product_id = models.CharField(max_length=50)
    product_name = models.CharField(max_length=255)
    product_image = models.URLField(max_length=1000)
    brand = models.CharField(max_length=100, blank=True, default='ZELORA')
    size = models.CharField(max_length=20, default='M')
    color = models.CharField(max_length=50, default='Noir Black')
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.product_name} x {self.quantity} ({self.size})"


class Notification(models.Model):
    CATEGORY_CHOICES = [
        ('orders', 'Orders'),
        ('promotions', 'Promotions'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='orders')
    title = models.CharField(max_length=255)
    description = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.category}] {self.title} - {self.user.email}"


class SellerShop(models.Model):
    owner = models.OneToOneField(User, on_delete=models.CASCADE, related_name='seller_shop')
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=150, default='Haute Couture & Designer Wear')
    description = models.TextField(blank=True, null=True)
    logo_url = models.URLField(max_length=1000, blank=True, null=True)
    banner_url = models.URLField(max_length=1000, blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    contact_number = models.CharField(max_length=50, blank=True, null=True)
    business_address = models.TextField(blank=True, null=True)
    is_open = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.owner.email})"


class Product(models.Model):
    GENDER_CHOICES = [
        ('men', 'Men'),
        ('women', 'Women'),
        ('unisex', 'Unisex'),
    ]

    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=255, db_index=True)
    slug = models.SlugField(max_length=255, unique=True)
    brand = models.CharField(max_length=150, default='ZELORA Atelier')
    category = models.CharField(max_length=100, db_index=True)  # outerwear, dresses, tops, trousers, knitwear, accessories
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, default='unisex', db_index=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, db_index=True)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discount = models.PositiveIntegerField(default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=4.80)
    review_count = models.PositiveIntegerField(default=0)
    in_stock = models.BooleanField(default=True, db_index=True)
    stock_quantity = models.PositiveIntegerField(default=10)
    description = models.TextField()
    image = models.URLField(max_length=1000)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} (₹{self.price})"

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "slug": self.slug,
            "brand": self.brand,
            "category": self.category,
            "gender": self.gender,
            "price": float(self.price),
            "original_price": float(self.original_price) if self.original_price else float(self.price),
            "discount": self.discount,
            "rating": float(self.rating),
            "review_count": self.review_count,
            "in_stock": bool(self.in_stock and self.stock_quantity > 0),
            "stock_quantity": self.stock_quantity,
            "description": self.description,
            "image": self.image,
        }

