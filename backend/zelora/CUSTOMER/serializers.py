from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, EmailVerificationCode, PasswordResetCode, Address, Order, OrderItem, Notification, SellerShop
from .emails import normalize_email_address


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'is_email_verified',
            'auth_provider',
            'avatar_url',
            'phone_number',
            'gender',
            'date_of_birth',
            'is_seller',
            'shop_name',
            'shop_category',
            'date_joined',
        ]
        read_only_fields = ['id', 'email', 'is_email_verified', 'auth_provider', 'date_joined']


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)

    def validate_email(self, value):
        email = value.lower().strip()
        existing = User.objects.filter(email=email).first()
        if existing and existing.is_email_verified:
            raise serializers.ValidationError("An account with this email already exists.")
        return email


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email', '').lower().strip()
        password = attrs.get('password')

        user = User.objects.filter(email=email).first()
        if not user or not user.check_password(password):
            raise serializers.ValidationError("Invalid email or password.")

        attrs['user'] = user
        return attrs


class VerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6)

    def validate(self, attrs):
        email = attrs.get('email', '').lower().strip()
        code = attrs.get('code', '').strip()

        user = User.objects.filter(email=email).first()
        if not user:
            raise serializers.ValidationError("User with this email does not exist.")

        verification = EmailVerificationCode.objects.filter(user=user, code=code, is_used=False).order_by('-created_at').first()
        if not verification or not verification.is_valid():
            raise serializers.ValidationError("Invalid or expired verification code.")

        attrs['user'] = user
        attrs['verification'] = verification
        return attrs


class ResendVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        email = value.lower().strip()
        user = User.objects.filter(email=email).first()
        if not user:
            raise serializers.ValidationError("User with this email does not exist.")
        if user.is_email_verified:
            raise serializers.ValidationError("Email is already verified.")
        return email


class ForgotPasswordRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=['customer', 'seller'], required=False)


class VerifyResetOtpSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6)
    role = serializers.ChoiceField(choices=['customer', 'seller'], required=False)

    def validate(self, attrs):
        email = normalize_email_address(attrs.get('email', ''))
        code = attrs.get('code', '').strip()
        role = attrs.get('role')

        if not code.isdigit() or len(code) != 6:
            raise serializers.ValidationError({"code": ["Please enter a valid 6-digit verification code."]})

        user = User.objects.filter(email=email).first()
        if not user:
            raise serializers.ValidationError({"email": ["No account found with this email address."]})

        if role == 'seller' and not getattr(user, 'is_seller', False):
            raise serializers.ValidationError({"email": ["This email is registered as a customer account. Please use Customer Forgot Password."]})

        reset_record = PasswordResetCode.objects.filter(user=user, code=code, is_used=False).order_by('-created_at').first()
        if not reset_record or not reset_record.is_valid():
            raise serializers.ValidationError({"code": ["Invalid or expired verification code. Please request a new code."]})

        attrs['email'] = email
        attrs['user'] = user
        attrs['reset_record'] = reset_record
        return attrs


class ResetPasswordConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6)
    new_password = serializers.CharField(write_only=True, min_length=6)

    def validate(self, attrs):
        email = normalize_email_address(attrs.get('email', ''))
        code = attrs.get('code', '').strip()
        new_password = attrs.get('new_password')

        user = User.objects.filter(email=email).first()
        if not user:
            raise serializers.ValidationError("User with this email does not exist.")

        reset_record = PasswordResetCode.objects.filter(user=user, code=code, is_used=False).order_by('-created_at').first()
        if not reset_record or not reset_record.is_valid():
            raise serializers.ValidationError("Invalid or expired password reset code.")

        attrs['user'] = user
        attrs['reset_record'] = reset_record
        return attrs


class GoogleAuthSerializer(serializers.Serializer):
    credential = serializers.CharField(required=False, allow_blank=True)
    access_token = serializers.CharField(required=False, allow_blank=True)
    is_seller = serializers.BooleanField(required=False, default=False)

    def validate(self, attrs):
        if not attrs.get('credential') and not attrs.get('access_token'):
            raise serializers.ValidationError("Either credential (ID token) or access_token is required.")
        return attrs


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = [
            'id',
            'full_name',
            'mobile_number',
            'house_building',
            'street_area',
            'city',
            'state',
            'pin_code',
            'address_type',
            'is_default',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            'id',
            'product_id',
            'product_name',
            'product_image',
            'brand',
            'size',
            'color',
            'quantity',
            'price',
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'order_id',
            'status',
            'created_at',
            'status_updated_at',
            'estimated_delivery',
            'subtotal',
            'discount',
            'delivery_charges',
            'tax',
            'total_amount',
            'payment_method',
            'payment_status',
            'delivery_method',
            'shipping_address',
            'tracking_number',
            'razorpay_order_id',
            'razorpay_payment_id',
            'razorpay_signature',
            'items',
        ]
        read_only_fields = ['id', 'created_at', 'status_updated_at']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id',
            'category',
            'title',
            'description',
            'is_read',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class SellerShopSerializer(serializers.ModelSerializer):
    class Meta:
        model = SellerShop
        fields = [
            'id',
            'name',
            'category',
            'description',
            'logo_url',
            'banner_url',
            'contact_email',
            'contact_number',
            'business_address',
            'is_open',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']
