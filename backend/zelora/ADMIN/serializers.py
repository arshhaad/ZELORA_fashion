from rest_framework import serializers
from CUSTOMER.models import User, SellerShop, Order, OrderItem, Address
from .models import (
    PlatformSetting,
    PlatformBanner,
    PlatformCoupon,
    PlatformReview,
    SupportTicket,
    SupportTicketReply,
    SellerPayoutRequest,
    AdminBroadcastNotification,
)


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'is_superuser',
            'is_staff',
            'is_active',
            'is_seller',
            'shop_name',
            'shop_category',
            'phone_number',
            'gender',
            'date_of_birth',
            'avatar_url',
            'date_joined',
            'last_login',
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']


class SellerShopAdminSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source='owner.email', read_only=True)
    owner_name = serializers.SerializerMethodField()

    class Meta:
        model = SellerShop
        fields = '__all__'

    def get_owner_name(self, obj):
        return f"{obj.owner.first_name} {obj.owner.last_name}".strip() or obj.owner.email.split('@')[0]


class PlatformSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformSetting
        fields = '__all__'


class PlatformBannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformBanner
        fields = '__all__'


class PlatformCouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformCoupon
        fields = '__all__'


class PlatformReviewSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = PlatformReview
        fields = '__all__'
        read_only_fields = ['id', 'created_at']

    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.email.split('@')[0]


class SupportTicketReplySerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()

    class Meta:
        model = SupportTicketReply
        fields = '__all__'
        read_only_fields = ['id', 'created_at']

    def get_sender_name(self, obj):
        return f"{obj.sender.first_name} {obj.sender.last_name}".strip() or obj.sender.email.split('@')[0]


class SupportTicketSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    replies = SupportTicketReplySerializer(many=True, read_only=True)

    class Meta:
        model = SupportTicket
        fields = '__all__'
        read_only_fields = ['id', 'ticket_number', 'created_at', 'updated_at']

    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.email.split('@')[0]


class SellerPayoutRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = SellerPayoutRequest
        fields = '__all__'
        read_only_fields = ['id', 'requested_at']


class AdminBroadcastNotificationSerializer(serializers.ModelSerializer):
    created_by_email = serializers.EmailField(source='created_by.email', read_only=True)

    class Meta:
        model = AdminBroadcastNotification
        fields = '__all__'
        read_only_fields = ['id', 'sent_at']

