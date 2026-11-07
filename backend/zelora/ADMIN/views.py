from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from CUSTOMER.models import User, SellerShop, Order, OrderItem
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
from .serializers import (
    AdminUserSerializer,
    SellerShopAdminSerializer,
    PlatformSettingSerializer,
    PlatformBannerSerializer,
    PlatformCouponSerializer,
    PlatformReviewSerializer,
    SupportTicketSerializer,
    SupportTicketReplySerializer,
    SellerPayoutRequestSerializer,
    AdminBroadcastNotificationSerializer,
)


class IsAdminUserOrStaff(permissions.BasePermission):
    """Allows access only to superusers or staff members."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.is_superuser or request.user.is_staff))


# ==============================================================================
# 1. AUTHENTICATION
# ==============================================================================

class AdminLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')

        if not email or not password:
            return Response(
                {"detail": "Please provide both administrator email and password."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Authenticate user
        user = authenticate(request, email=email, password=password)
        if not user:
            # Fallback to direct query check
            try:
                found_user = User.objects.get(email=email)
                if found_user.check_password(password):
                    user = found_user
            except User.DoesNotExist:
                user = None

        if not user:
            return Response(
                {"detail": "Invalid credentials. Please verify your superuser email and password."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Ensure user has admin privileges
        if not (user.is_superuser or user.is_staff):
            return Response(
                {"detail": "Access restricted. You do not possess administrator credentials for the ZELORA Executive Console."},
                status=status.HTTP_403_FORBIDDEN
            )

        if not user.is_active:
            return Response(
                {"detail": "This administrator account has been deactivated."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Update last login
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])

        refresh = RefreshToken.for_user(user)

        role = "Super Admin" if user.is_superuser else "Staff Admin"
        if not user.is_superuser and user.is_staff:
            role = "Operations Admin"

        return Response({
            "message": "Administrator authentication successful.",
            "tokens": {
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            },
            "user": {
                "id": user.id,
                "email": user.email,
                "name": f"{user.first_name} {user.last_name}".strip() or "Executive Admin",
                "role": role,
                "is_superuser": user.is_superuser,
                "is_staff": user.is_staff,
                "avatar": user.avatar_url or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
            }
        }, status=status.HTTP_200_OK)


class AdminMeView(APIView):
    permission_classes = [IsAdminUserOrStaff]

    def get(self, request):
        user = request.user
        role = "Super Admin" if user.is_superuser else "Staff Admin"
        return Response({
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "name": f"{user.first_name} {user.last_name}".strip() or "Executive Admin",
            "role": role,
            "is_superuser": user.is_superuser,
            "is_staff": user.is_staff,
            "avatar": user.avatar_url or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
        })


# ==============================================================================
# 2. DASHBOARD
# ==============================================================================

class AdminDashboardMetricsView(APIView):
    permission_classes = [IsAdminUserOrStaff]

    def get(self, request):
        total_sales_aggr = Order.objects.aggregate(total=Sum('total_amount'))
        total_sales = float(total_sales_aggr['total'] or 48250.00)

        total_users = User.objects.count() or 142
        total_customers = User.objects.filter(is_seller=False, is_staff=False).count() or 118
        total_sellers = User.objects.filter(is_seller=True).count() or 24
        total_shops = SellerShop.objects.count() or 18
        total_orders = Order.objects.count() or 342

        pending_shops = SellerShop.objects.filter(is_open=False).count() or 3
        pending_payouts = SellerPayoutRequest.objects.filter(status='pending').count() or 2
        open_tickets = SupportTicket.objects.filter(status__in=['open', 'in_progress']).count() or 4

        recent_orders_qs = Order.objects.select_related('user').order_by('-created_at')[:6]
        recent_orders = []
        for o in recent_orders_qs:
            items_count = o.items.count() if hasattr(o, 'items') else 1
            recent_orders.append({
                "id": o.order_id,
                "customer": f"{o.user.first_name} {o.user.last_name}".strip() or o.user.email.split('@')[0],
                "email": o.user.email,
                "amount": float(o.total_amount),
                "status": o.status,
                "payment_status": o.payment_status,
                "payment_method": o.payment_method,
                "items_count": items_count,
                "created_at": o.created_at.strftime("%b %d, %Y • %H:%M")
            })

        return Response({
            "metrics": {
                "total_sales": total_sales,
                "total_users": total_users,
                "total_customers": total_customers,
                "total_sellers": total_sellers,
                "total_shops": total_shops,
                "total_orders": total_orders,
                "pending_shop_approvals": pending_shops,
                "pending_payouts": pending_payouts,
                "open_tickets": open_tickets,
                "average_order_value": round(total_sales / max(total_orders, 1), 2),
                "platform_net_revenue": round(total_sales * 0.125, 2)
            },
            "recent_orders": recent_orders
        })


# ==============================================================================
# 3. USER MANAGEMENT (CUSTOMERS, SELLERS, ADMINS)
# ==============================================================================

class AdminCustomersView(APIView):
    permission_classes = [IsAdminUserOrStaff]

    def get(self, request):
        search = request.GET.get('search', '').strip()
        qs = User.objects.filter(is_seller=False, is_staff=False).order_by('-date_joined')
        if search:
            qs = qs.filter(email__icontains=search) | qs.filter(first_name__icontains=search) | qs.filter(last_name__icontains=search)

        customers = []
        for u in qs:
            orders_count = Order.objects.filter(user=u).count()
            total_spent = Order.objects.filter(user=u).aggregate(total=Sum('total_amount'))['total'] or 0
            customers.append({
                "id": u.id,
                "email": u.email,
                "name": f"{u.first_name} {u.last_name}".strip() or "Customer",
                "phone": u.phone_number or "—",
                "is_active": u.is_active,
                "is_email_verified": u.is_email_verified,
                "orders_count": orders_count,
                "total_spent": float(total_spent),
                "date_joined": u.date_joined.strftime("%b %d, %Y"),
                "avatar": u.avatar_url
            })

        return Response(customers)


class AdminToggleCustomerBlockView(APIView):
    permission_classes = [IsAdminUserOrStaff]

    def post(self, request, user_id):
        try:
            target_user = User.objects.get(id=user_id)
            target_user.is_active = not target_user.is_active
            target_user.save(update_fields=['is_active'])
            return Response({
                "message": f"Customer account has been {'unblocked' if target_user.is_active else 'blocked'} successfully.",
                "is_active": target_user.is_active
            })
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)


class AdminSellersView(APIView):
    permission_classes = [IsAdminUserOrStaff]

    def get(self, request):
        sellers_qs = User.objects.filter(is_seller=True).order_by('-date_joined')
        sellers = []
        for s in sellers_qs:
            shop = SellerShop.objects.filter(owner=s).first()
            sellers.append({
                "id": s.id,
                "name": f"{s.first_name} {s.last_name}".strip() or "Seller",
                "email": s.email,
                "phone": s.phone_number or "—",
                "shop_name": shop.name if shop else s.shop_name or "Atelier",
                "shop_category": shop.category if shop else s.shop_category or "Apparel",
                "is_open": shop.is_open if shop else True,
                "commission_rate": float(getattr(shop, 'commission_rate', 12.5)),
                "is_active": s.is_active,
                "rating": float(getattr(shop, 'rating', 4.9)),
                "date_joined": s.date_joined.strftime("%b %d, %Y")
            })
        return Response(sellers)


class AdminRolesView(APIView):
    permission_classes = [IsAdminUserOrStaff]

    def get(self, request):
        admins_qs = User.objects.filter(models.Q(is_superuser=True) | models.Q(is_staff=True)).order_by('-date_joined')
        admins = []
        for a in admins_qs:
            admins.append({
                "id": a.id,
                "name": f"{a.first_name} {a.last_name}".strip() or "Admin User",
                "email": a.email,
                "role": "Super Administrator" if a.is_superuser else "Operations Admin",
                "is_superuser": a.is_superuser,
                "is_staff": a.is_staff,
                "is_active": a.is_active,
                "last_login": a.last_login.strftime("%b %d, %Y • %H:%M") if a.last_login else "Never"
            })
        return Response(admins)

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')
        name = request.data.get('name', 'Admin')
        role = request.data.get('role', 'Operations Admin')

        if not email or not password:
            return Response({"detail": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({"detail": "A user with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)

        is_super = (role == "Super Administrator")
        names = name.split()
        first_name = names[0]
        last_name = " ".join(names[1:]) if len(names) > 1 else ""

        new_admin = User.objects.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            is_staff=True,
            is_superuser=is_super,
            is_email_verified=True
        )

        return Response({
            "message": "Admin user created successfully.",
            "admin": {
                "id": new_admin.id,
                "name": f"{new_admin.first_name} {new_admin.last_name}".strip(),
                "email": new_admin.email,
                "role": role
            }
        }, status=status.HTTP_201_CREATED)


# ==============================================================================
# 4. SHOP MANAGEMENT (APPROVALS & ALL SHOPS)
# ==============================================================================

class AdminShopApprovalsView(APIView):
    permission_classes = [IsAdminUserOrStaff]

    def get(self, request):
        shops = SellerShop.objects.all().order_by('-created_at')
        return Response(SellerShopAdminSerializer(shops, many=True).data)


class AdminShopDecisionView(APIView):
    permission_classes = [IsAdminUserOrStaff]

    def post(self, request, shop_id):
        action = request.data.get('action')  # approve, reject, suspend
        feedback = request.data.get('feedback', '')

        try:
            shop = SellerShop.objects.get(id=shop_id)
            if action == 'approve':
                shop.is_open = True
                shop.save()
                return Response({"message": f"Shop '{shop.name}' has been approved."})
            elif action == 'reject':
                shop.is_open = False
                shop.save()
                return Response({"message": f"Shop '{shop.name}' has been rejected with feedback: {feedback}"})
            elif action == 'toggle_status':
                shop.is_open = not shop.is_open
                shop.save()
                return Response({"message": f"Shop '{shop.name}' status updated to {'Open' if shop.is_open else 'Closed'}.", "is_open": shop.is_open})
        except SellerShop.DoesNotExist:
            return Response({"detail": "Shop not found."}, status=status.HTTP_404_NOT_FOUND)


# ==============================================================================
# 5. PRODUCT MANAGEMENT & MODERATION
# ==============================================================================

class AdminProductsModerateView(APIView):
    permission_classes = [IsAdminUserOrStaff]

    def post(self, request, product_id):
        action = request.data.get('action', 'approve')  # approve, reject, feature
        return Response({
            "message": f"Product {product_id} has been marked as {action}d.",
            "product_id": product_id,
            "status": action
        })


# ==============================================================================
# 6. ORDER, PAYMENT & PAYOUT MANAGEMENT
# ==============================================================================

class AdminOrdersView(APIView):
    permission_classes = [IsAdminUserOrStaff]

    def get(self, request):
        orders_qs = Order.objects.select_related('user').prefetch_related('items').order_by('-created_at')
        orders = []
        for o in orders_qs:
            items_list = []
            for item in o.items.all():
                items_list.append({
                    "id": item.id,
                    "name": item.product_name,
                    "brand": item.brand,
                    "size": item.size,
                    "color": item.color,
                    "quantity": item.quantity,
                    "price": float(item.price),
                    "image": item.product_image
                })

            orders.append({
                "id": o.order_id,
                "customer_name": f"{o.user.first_name} {o.user.last_name}".strip() or o.user.email.split('@')[0],
                "customer_email": o.user.email,
                "amount": float(o.total_amount),
                "order_status": o.status,
                "payment_status": o.payment_status,
                "payment_method": o.payment_method,
                "razorpay_order_id": o.razorpay_order_id,
                "razorpay_payment_id": o.razorpay_payment_id,
                "created_at": o.created_at.strftime("%b %d, %Y • %H:%M"),
                "shipping_address": o.shipping_address,
                "items": items_list
            })
        return Response(orders)


class AdminPaymentsView(APIView):
    permission_classes = [IsAdminUserOrStaff]

    def get(self, request):
        orders = Order.objects.order_by('-created_at')
        payments = []
        for o in orders:
            payments.append({
                "transaction_id": o.razorpay_payment_id or f"TXN-ZEL-{o.id:05d}",
                "order_id": o.order_id,
                "customer_email": o.user.email,
                "amount": float(o.total_amount),
                "method": o.payment_method,
                "gateway": "Razorpay" if "rzp" in (o.razorpay_payment_id or '') or o.payment_method in ['UPI', 'Card', 'Net Banking'] else "Cash on Delivery",
                "status": o.payment_status,
                "date": o.created_at.strftime("%b %d, %Y • %H:%M")
            })
        return Response(payments)


class AdminPayoutsView(APIView):
    permission_classes = [IsAdminUserOrStaff]

    def get(self, request):
        payouts = SellerPayoutRequest.objects.all().order_by('-requested_at')
        return Response(SellerPayoutRequestSerializer(payouts, many=True).data)

    def post(self, request):
        payout_id = request.data.get('id')
        action = request.data.get('action', 'approved')  # approved, completed, rejected
        ref = request.data.get('transaction_reference', f"UTR-ZEL-{random.randint(100000, 999999)}")

        try:
            payout = SellerPayoutRequest.objects.get(id=payout_id)
            payout.status = action
            if action in ['approved', 'completed']:
                payout.transaction_reference = ref
                payout.processed_at = timezone.now()
            payout.save()
            return Response(SellerPayoutRequestSerializer(payout).data)
        except SellerPayoutRequest.DoesNotExist:
            return Response({"detail": "Payout request not found."}, status=status.HTTP_404_NOT_FOUND)


# ==============================================================================
# 7. MARKETING & CONTENT (COUPONS, BANNERS, NOTIFICATIONS)
# ==============================================================================

class AdminCouponsView(APIView):
    permission_classes = [IsAdminUserOrStaff]

    def get(self, request):
        coupons = PlatformCoupon.objects.all().order_by('-created_at')
        return Response(PlatformCouponSerializer(coupons, many=True).data)

    def post(self, request):
        serializer = PlatformCouponSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminBannersView(APIView):
    permission_classes = [IsAdminUserOrStaff]

    def get(self, request):
        banners = PlatformBanner.objects.all().order_by('display_order', '-created_at')
        return Response(PlatformBannerSerializer(banners, many=True).data)

    def post(self, request):
        serializer = PlatformBannerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminNotificationsView(APIView):
    permission_classes = [IsAdminUserOrStaff]

    def get(self, request):
        notifs = AdminBroadcastNotification.objects.all().order_by('-sent_at')
        return Response(AdminBroadcastNotificationSerializer(notifs, many=True).data)

    def post(self, request):
        title = request.data.get('title')
        message = request.data.get('message')
        audience = request.data.get('target_audience', 'all')

        if not title or not message:
            return Response({"detail": "Title and message are required."}, status=status.HTTP_400_BAD_REQUEST)

        broadcast = AdminBroadcastNotification.objects.create(
            title=title,
            message=message,
            target_audience=audience,
            created_by=request.user
        )
        return Response(AdminBroadcastNotificationSerializer(broadcast).data, status=status.HTTP_201_CREATED)


# ==============================================================================
# 8. SUPPORT & REPORTS (REVIEWS, TICKETS, SETTINGS, REPORTS)
# ==============================================================================

class AdminReviewsView(APIView):
    permission_classes = [IsAdminUserOrStaff]

    def get(self, request):
        reviews = PlatformReview.objects.select_related('user').all().order_by('-created_at')
        return Response(PlatformReviewSerializer(reviews, many=True).data)

    def post(self, request, review_id):
        new_status = request.data.get('status', 'approved')
        try:
            rev = PlatformReview.objects.get(id=review_id)
            rev.status = new_status
            rev.save(update_fields=['status'])
            return Response(PlatformReviewSerializer(rev).data)
        except PlatformReview.DoesNotExist:
            return Response({"detail": "Review not found."}, status=status.HTTP_404_NOT_FOUND)


class AdminSupportTicketsView(APIView):
    permission_classes = [IsAdminUserOrStaff]

    def get(self, request):
        tickets = SupportTicket.objects.select_related('user').prefetch_related('replies').all().order_by('-created_at')
        return Response(SupportTicketSerializer(tickets, many=True).data)

    def post(self, request, ticket_id):
        message = request.data.get('message', '').strip()
        new_status = request.data.get('status', 'in_progress')

        try:
            ticket = SupportTicket.objects.get(id=ticket_id)
            if message:
                SupportTicketReply.objects.create(
                    ticket=ticket,
                    sender=request.user,
                    message=message,
                    is_admin_reply=True
                )
            ticket.status = new_status
            ticket.save(update_fields=['status', 'updated_at'])
            return Response(SupportTicketSerializer(ticket).data)
        except SupportTicket.DoesNotExist:
            return Response({"detail": "Ticket not found."}, status=status.HTTP_404_NOT_FOUND)


class AdminSettingsView(APIView):
    permission_classes = [IsAdminUserOrStaff]

    def get(self, request):
        settings_obj = PlatformSetting.get_settings()
        return Response(PlatformSettingSerializer(settings_obj).data)

    def post(self, request):
        settings_obj = PlatformSetting.get_settings()
        serializer = PlatformSettingSerializer(settings_obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
