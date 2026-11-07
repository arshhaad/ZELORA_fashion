from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    LoginView,
    VerifyEmailView,
    ResendVerificationView,
    GoogleAuthView,
    ForgotPasswordRequestView,
    ResetPasswordConfirmView,
    LogoutView,
    MeView,
    ProfileUpdateView,
    AddressListCreateView,
    AddressDetailView,
    AddressSetDefaultView,
    OrderListCreateView,
    OrderDetailView,
    OrderCancelView,
    OrderReturnView,
    NotificationListView,
    NotificationMarkReadView,
    NotificationDeleteView,
    RazorpayConfigView,
    RazorpayOrderCreateView,
    RazorpayPaymentVerifyView,
    SellerRegisterView,
    SellerLoginView,
    SellerShopProfileView,
    SendSellerOtpView,
    VerifySellerOtpView,
)

urlpatterns = [
    # Auth Endpoints
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('login/', LoginView.as_view(), name='auth-login'),
    path('verify-email/', VerifyEmailView.as_view(), name='auth-verify-email'),
    path('resend-verification/', ResendVerificationView.as_view(), name='auth-resend-verification'),
    path('seller/send-otp/', SendSellerOtpView.as_view(), name='seller-send-otp'),
    path('seller/verify-otp/', VerifySellerOtpView.as_view(), name='seller-verify-otp'),
    path('google/', GoogleAuthView.as_view(), name='auth-google'),
    path('forgot-password/', ForgotPasswordRequestView.as_view(), name='auth-forgot-password'),
    path('reset-password/', ResetPasswordConfirmView.as_view(), name='auth-reset-password'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),
    path('me/', MeView.as_view(), name='auth-me'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    # Profile & Account
    path('profile/', ProfileUpdateView.as_view(), name='customer-profile'),

    # Addresses
    path('addresses/', AddressListCreateView.as_view(), name='customer-addresses'),
    path('addresses/<int:pk>/', AddressDetailView.as_view(), name='customer-address-detail'),
    path('addresses/<int:pk>/default/', AddressSetDefaultView.as_view(), name='customer-address-default'),

    # Orders
    path('orders/', OrderListCreateView.as_view(), name='customer-orders'),
    path('orders/<str:order_id>/', OrderDetailView.as_view(), name='customer-order-detail'),
    path('orders/<str:order_id>/cancel/', OrderCancelView.as_view(), name='customer-order-cancel'),
    path('orders/<str:order_id>/return/', OrderReturnView.as_view(), name='customer-order-return'),

    # Notifications
    path('notifications/', NotificationListView.as_view(), name='customer-notifications'),
    path('notifications/read-all/', NotificationMarkReadView.as_view(), name='customer-notifications-read-all'),
    path('notifications/<int:pk>/read/', NotificationMarkReadView.as_view(), name='customer-notification-read'),
    path('notifications/<int:pk>/', NotificationDeleteView.as_view(), name='customer-notification-delete'),

    # Razorpay Payment Gateway
    path('payment/razorpay/config/', RazorpayConfigView.as_view(), name='razorpay-config'),
    path('payment/razorpay/create-order/', RazorpayOrderCreateView.as_view(), name='razorpay-create-order'),
    path('payment/razorpay/verify/', RazorpayPaymentVerifyView.as_view(), name='razorpay-verify'),

    # Seller & Atelier Endpoints
    path('seller/register/', SellerRegisterView.as_view(), name='seller-register'),
    path('seller/login/', SellerLoginView.as_view(), name='seller-login'),
    path('seller/shop/', SellerShopProfileView.as_view(), name='seller-shop'),
]
