from django.urls import path
from .views import (
    AdminLoginView,
    AdminMeView,
    AdminDashboardMetricsView,
    AdminCustomersView,
    AdminToggleCustomerBlockView,
    AdminSellersView,
    AdminRolesView,
    AdminShopApprovalsView,
    AdminShopDecisionView,
    AdminProductsModerateView,
    AdminOrdersView,
    AdminPaymentsView,
    AdminPayoutsView,
    AdminCouponsView,
    AdminBannersView,
    AdminNotificationsView,
    AdminReviewsView,
    AdminSupportTicketsView,
    AdminSettingsView,
)

urlpatterns = [
    # 1. Auth
    path('auth/login/', AdminLoginView.as_view(), name='admin-login'),
    path('auth/me/', AdminMeView.as_view(), name='admin-me'),

    # 2. Dashboard
    path('dashboard/metrics/', AdminDashboardMetricsView.as_view(), name='admin-metrics'),

    # 3. User Management
    path('users/customers/', AdminCustomersView.as_view(), name='admin-customers'),
    path('users/customers/<int:user_id>/toggle-block/', AdminToggleCustomerBlockView.as_view(), name='admin-customer-block'),
    path('users/sellers/', AdminSellersView.as_view(), name='admin-sellers'),
    path('users/admins/', AdminRolesView.as_view(), name='admin-admins'),

    # 4. Shop Management
    path('shops/approvals/', AdminShopApprovalsView.as_view(), name='admin-shop-approvals'),
    path('shops/<int:shop_id>/decision/', AdminShopDecisionView.as_view(), name='admin-shop-decision'),

    # 5. Product Management
    path('products/<str:product_id>/moderate/', AdminProductsModerateView.as_view(), name='admin-product-moderate'),

    # 6. Orders, Payments, Payouts
    path('orders/', AdminOrdersView.as_view(), name='admin-orders'),
    path('payments/', AdminPaymentsView.as_view(), name='admin-payments'),
    path('payouts/', AdminPayoutsView.as_view(), name='admin-payouts'),

    # 7. Marketing & Content
    path('coupons/', AdminCouponsView.as_view(), name='admin-coupons'),
    path('banners/', AdminBannersView.as_view(), name='admin-banners'),
    path('notifications/', AdminNotificationsView.as_view(), name='admin-notifications'),

    # 8. Support & Reports
    path('reviews/', AdminReviewsView.as_view(), name='admin-reviews'),
    path('reviews/<int:review_id>/', AdminReviewsView.as_view(), name='admin-review-moderate'),
    path('tickets/', AdminSupportTicketsView.as_view(), name='admin-tickets'),
    path('tickets/<int:ticket_id>/reply/', AdminSupportTicketsView.as_view(), name='admin-ticket-reply'),
    path('settings/', AdminSettingsView.as_view(), name='admin-settings'),
]

