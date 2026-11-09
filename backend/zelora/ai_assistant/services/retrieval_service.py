import re
from decimal import Decimal
from django.db.models import Sum, Count, Q
from CUSTOMER.models import Order, OrderItem, Address, SellerShop, User
from ADMIN.models import SupportTicket, SellerPayoutRequest


class SecurityViolationError(Exception):
    """Raised when an unauthorized data access attempt is detected."""
    pass


class RetrievalService:
    """
    Deterministic, role-bounded database retrieval service.
    Guarantees zero unrestricted AI-generated SQL and strictly isolates user records.
    Never trusts parameters sent from the frontend.
    """

    @staticmethod
    def detect_unauthorized_cross_tenant_intent(message: str, user: User) -> bool:
        """
        Analyzes message for attempts to query other users' private records.
        """
        lower = message.lower()
        cross_user_patterns = [
            r"other (user|customer|seller|client|buyer)'s? orders?",
            r"someone else's? (order|sale|product|address|money)",
            r"orders? (of|for|belonging to) (user|id|customer|another)",
            r"show me all users",
            r"all customers? (list|records|orders)",
            r"passwords?",
            r"api key",
            r"secret key",
            r"database dump",
            r"raw sql",
        ]
        
        # If user is not staff/admin, block requests attempting to probe other users
        if not (user.is_staff or user.is_superuser):
            for pat in cross_user_patterns:
                if re.search(pat, lower):
                    return True
        return False

    @staticmethod
    def get_customer_orders_summary(user: User, limit: int = 5):
        """
        Retrieves ONLY orders belonging to the authenticated user.
        """
        orders = Order.objects.filter(user=user).prefetch_related('items').order_by('-created_at')[:limit]
        result = []
        for o in orders:
            items_desc = [
                f"{it.product_name} (Qty: {it.quantity}, ₹{it.price})"
                for it in o.items.all()
            ]
            result.append({
                "order_id": o.order_id,
                "date": o.created_at.strftime("%b %d, %Y"),
                "status": o.status,
                "payment_status": o.payment_status,
                "payment_method": o.payment_method,
                "total_amount": f"₹{o.total_amount}",
                "estimated_delivery": o.estimated_delivery,
                "tracking_number": o.tracking_number or "Pending courier assignment",
                "delivery_method": o.delivery_method,
                "items": items_desc,
            })
        return result

    @staticmethod
    def get_customer_latest_order(user: User):
        """
        Retrieves latest order for the authenticated user.
        """
        order = Order.objects.filter(user=user).prefetch_related('items').order_by('-created_at').first()
        if not order:
            return None
        return {
            "order_id": order.order_id,
            "date": order.created_at.strftime("%b %d, %Y"),
            "status": order.status,
            "payment_status": order.payment_status,
            "payment_method": order.payment_method,
            "total_amount": f"₹{order.total_amount}",
            "estimated_delivery": order.estimated_delivery,
            "tracking_number": order.tracking_number or "Will update upon dispatch",
            "delivery_method": order.delivery_method,
            "items": [it.product_name for it in order.items.all()],
        }

    @staticmethod
    def get_customer_addresses(user: User):
        """
        Retrieves addresses belonging to the authenticated user.
        """
        addresses = Address.objects.filter(user=user).order_by('-is_default', '-created_at')[:3]
        return [
            {
                "full_name": a.full_name,
                "mobile_number": a.mobile_number,
                "line": f"{a.house_building}, {a.street_area}",
                "city": a.city,
                "state": a.state,
                "pin_code": a.pin_code,
                "type": a.address_type,
                "is_default": a.is_default
            }
            for a in addresses
        ]

    @staticmethod
    def get_customer_stats(user: User):
        """
        Returns order counts and total spending for the authenticated user.
        """
        orders_count = Order.objects.filter(user=user).count()
        total_spent = Order.objects.filter(user=user).aggregate(total=Sum('total_amount'))['total'] or 0.00
        return {
            "total_orders": orders_count,
            "total_spent": f"₹{float(total_spent):,.2f}",
        }

    # =========================================================================
    # SELLER-SCOPED RETRIEVAL
    # =========================================================================
    @staticmethod
    def get_seller_shop_details(user: User):
        """
        Retrieves shop owned exclusively by the authenticated user.
        """
        if not user.is_seller:
            return None
        try:
            shop = SellerShop.objects.get(owner=user)
            return {
                "name": shop.name,
                "category": shop.category,
                "description": shop.description,
                "is_open": shop.is_open,
                "created_at": shop.created_at.strftime("%b %d, %Y"),
                "contact_email": shop.contact_email or user.email,
            }
        except SellerShop.DoesNotExist:
            return None

    @staticmethod
    def get_seller_orders_and_sales(user: User):
        """
        Retrieves sales metrics and orders relevant to the seller's brand/shop.
        """
        if not user.is_seller:
            return None
        
        shop = SellerShop.objects.filter(owner=user).first()
        shop_name = shop.name if shop else user.shop_name or "Atelier"
        
        # Bounded query: find order items matching this shop's brand name
        items_qs = OrderItem.objects.filter(brand__iexact=shop_name)
        total_items_sold = items_qs.aggregate(total_qty=Sum('quantity'))['total_qty'] or 0
        total_sales_volume = items_qs.aggregate(
            volume=Sum('price')
        )['volume'] or 0.00
        
        # Recent associated orders
        recent_order_ids = items_qs.values_list('order_id', flat=True).distinct()[:10]
        recent_orders = Order.objects.filter(id__in=recent_order_ids).order_by('-created_at')[:5]
        
        orders_data = [
            {
                "order_id": o.order_id,
                "status": o.status,
                "date": o.created_at.strftime("%b %d, %Y"),
                "total_amount": f"₹{o.total_amount}",
            }
            for o in recent_orders
        ]

        return {
            "shop_name": shop_name,
            "total_units_sold": total_items_sold,
            "estimated_sales_volume": f"₹{float(total_sales_volume):,.2f}",
            "recent_orders": orders_data
        }

    # =========================================================================
    # ADMIN-SCOPED RETRIEVAL
    # =========================================================================
    @staticmethod
    def get_admin_marketplace_metrics(user: User):
        """
        Only executable by verified staff / superuser administrators.
        """
        if not (user.is_staff or user.is_superuser):
            raise SecurityViolationError("Access denied: Administrative privileges required.")

        total_sales_aggr = Order.objects.aggregate(total=Sum('total_amount'))['total'] or 0.00
        total_orders = Order.objects.count()
        total_users = User.objects.count()
        total_customers = User.objects.filter(is_seller=False, is_staff=False).count()
        total_sellers = User.objects.filter(is_seller=True).count()
        total_shops = SellerShop.objects.count()
        pending_shops = SellerShop.objects.filter(is_open=False).count()
        pending_payouts = SellerPayoutRequest.objects.filter(status='pending').count()
        open_tickets = SupportTicket.objects.filter(status__in=['open', 'in_progress']).count()

        return {
            "platform_gross_merchandise_volume": f"₹{float(total_sales_aggr):,.2f}",
            "platform_net_commission_revenue": f"₹{float(total_sales_aggr) * 0.125:,.2f}",
            "total_orders_placed": total_orders,
            "total_registered_users": total_users,
            "total_customers": total_customers,
            "total_sellers": total_sellers,
            "total_boutique_shops": total_shops,
            "pending_boutique_approvals": pending_shops,
            "pending_seller_payout_requests": pending_payouts,
            "open_support_tickets": open_tickets,
        }

