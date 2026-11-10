import re
from decimal import Decimal
from typing import Dict, Any, List, Tuple
from django.db.models import Sum, Count, Q
from CUSTOMER.models import Order, OrderItem, Address, SellerShop, User, Product
from ADMIN.models import SupportTicket, SellerPayoutRequest



class SecurityViolationError(Exception):
    """Raised when an unauthorized data access attempt is detected."""
    pass


ZELORA_CATALOG = [
    {
        "id": "zel-001",
        "name": "Structured Double-Breasted Wool Overcoat",
        "category": "Outerwear",
        "price": 349,
        "original_price": 420,
        "rating": 4.9,
        "brand": "ZELORA Atelier",
        "image": "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80&sat=-100",
        "description": "Architectural virgin wool melton overcoat with sharp shoulder pads and fluid drape.",
        "keywords": ["coat", "overcoat", "wool", "outerwear", "trench", "jacket", "winter", "black coat"]
    },
    {
        "id": "zel-002",
        "name": "Draped Silk Evening Slip Gown",
        "category": "Dresses",
        "price": 260,
        "original_price": 320,
        "rating": 4.8,
        "brand": "ZELORA Noir",
        "image": "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80&sat=-100",
        "description": "Fluid 22-Momme Mulberry silk gown cut on the bias with asymmetrical cowl neck.",
        "keywords": ["gown", "dress", "evening", "slip", "silk", "gala", "party", "wedding"]
    },
    {
        "id": "zel-003",
        "name": "Oversized Poplin Studio Shirt",
        "category": "Tops",
        "price": 145,
        "original_price": 180,
        "rating": 4.7,
        "brand": "Studio Monolith",
        "image": "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=800&q=80&sat=-100",
        "description": "Crisp Italian cotton poplin with relaxed tailoring and shell buttons.",
        "keywords": ["shirt", "poplin", "top", "button", "cotton", "casual", "white shirt"]
    },
    {
        "id": "zel-004",
        "name": "Architectural Double-Breasted Wool Trench",
        "category": "Outerwear",
        "price": 420,
        "original_price": 490,
        "rating": 5.0,
        "brand": "ZELORA Atelier",
        "image": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80&sat=-100",
        "description": "Sculptural double-faced bonded wool trench coat with belted waist.",
        "keywords": ["trench", "belted", "wool", "coat", "heavyweight"]
    },
    {
        "id": "zel-005",
        "name": "High-Waist Pleated Wool Flannel Trousers",
        "category": "Trousers",
        "price": 185,
        "original_price": 220,
        "rating": 4.8,
        "brand": "ZELORA Tailoring",
        "image": "https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?auto=format&fit=crop&w=800&q=80&sat=-100",
        "description": "Double forward pleats and high-rise waistband in fine wool flannel.",
        "keywords": ["trousers", "pants", "pleated", "wool", "tailored", "flannel"]
    },
    {
        "id": "zel-006",
        "name": "Cashmere Mock-Neck Cocoon Knit",
        "category": "Knitwear",
        "price": 240,
        "original_price": 290,
        "rating": 4.9,
        "brand": "Maison Minimal",
        "image": "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=800&q=80&sat=-100",
        "description": "Grade-A Mongolian cashmere with tactile cocoon silhouette.",
        "keywords": ["knit", "sweater", "cashmere", "turtleneck", "mock-neck", "warm"]
    },
    {
        "id": "zel-008",
        "name": "Square-Toe Italian Calfskin Ankle Boots",
        "category": "Footwear",
        "price": 310,
        "original_price": 360,
        "rating": 4.9,
        "brand": "ZELORA Leather",
        "image": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80&sat=-100",
        "description": "Vegetable-tanned calfskin boots with architectural block heel.",
        "keywords": ["boots", "shoes", "leather", "calfskin", "footwear", "ankle"]
    },
    {
        "id": "zel-010",
        "name": "Architectural Calfskin Frame Bag",
        "category": "Bags",
        "price": 290,
        "original_price": 340,
        "rating": 4.9,
        "brand": "Studio Monolith",
        "image": "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80&sat=-100",
        "description": "Geometric hand-stitched structured calfskin frame tote with silver hardware.",
        "keywords": ["bag", "tote", "handbag", "purse", "accessories", "leather"]
    }
]


class RetrievalService:
    """
    Deterministic, role-bounded database retrieval service.
    Guarantees zero unrestricted AI-generated SQL and strictly isolates user records.
    Never trusts parameters sent from the frontend.
    """

    @classmethod
    def parse_product_query(cls, message: str) -> Dict[str, Any]:
        """
        Extracts structured shopping filters from natural language queries.
        Supports budget ranges, specific prices, gender, category, availability, occasion, and counts.
        """
        msg = message.lower().strip()
        parsed = {
            "budget_min": None,
            "budget_max": None,
            "gender": None,
            "category": None,
            "only_unavailable": False,
            "occasion": None,
            "limit": None,
            "keywords": [],
            "raw_query": msg,
        }

        # 1. Availability check (e.g., "products that are currently unavailable")
        if re.search(r'\b(unavailable|out of stock|sold out|not available|un-available)\b', msg):
            parsed["only_unavailable"] = True

        # 2. Count / Limit extraction (e.g. "show 5 products", "recommend 3 pieces")
        limit_match = re.search(r'\b(?:show|give|recommend|display|list|find)?\s*(\d+)\s*(?:products|items|pieces|options|garments|recommendations|clothes)\b', msg)
        if limit_match:
            try:
                val = int(limit_match.group(1))
                if 1 <= val <= 20:
                    parsed["limit"] = val
            except ValueError:
                pass

        # 3. Budget Range: between X and Y / from X to Y
        range_match = re.search(r'(?:between|from)\s*(?:rs\.?|inr|rupees|₹)?\s*(\d+(?:,\d+)?)\s*(?:and|to|-)\s*(?:rs\.?|inr|rupees|₹)?\s*(\d+(?:,\d+)?)', msg)
        if range_match:
            val1 = float(range_match.group(1).replace(',', ''))
            val2 = float(range_match.group(2).replace(',', ''))
            parsed["budget_min"] = min(val1, val2)
            parsed["budget_max"] = max(val1, val2)
        else:
            # Under / Below / Less than / Upto / Max budget
            under_match = re.search(r'(?:under|below|less\s+than|within|upto|up\s+to|max(?:imum)?|budget\s+(?:of|is)?)\s*(?:rs\.?|inr|rupees|₹)?\s*(\d+(?:,\d+)?)', msg)
            if under_match:
                parsed["budget_max"] = float(under_match.group(1).replace(',', ''))
            else:
                # Direct format: "1000 rs", "1000rs product", "₹1000 product"
                direct_rs = re.search(r'(\d+(?:,\d+)?)\s*(?:rs|inr|rupees)', msg)
                direct_symbol = re.search(r'₹\s*(\d+(?:,\d+)?)', msg)
                if direct_rs:
                    parsed["budget_max"] = float(direct_rs.group(1).replace(',', ''))
                elif direct_symbol:
                    parsed["budget_max"] = float(direct_symbol.group(1).replace(',', ''))

            # Min budget / Above / More than
            above_match = re.search(r'(?:above|over|more\s+than|greater\s+than|min(?:imum)?)\s*(?:rs\.?|inr|rupees|₹)?\s*(\d+(?:,\d+)?)', msg)
            if above_match:
                parsed["budget_min"] = float(above_match.group(1).replace(',', ''))

        # 4. Gender Extraction
        if re.search(r'\b(men|mens|men\'s|male|gentleman|gentlemen|guy|guys|boy|boys)\b', msg):
            parsed["gender"] = "men"
        elif re.search(r'\b(women|womens|women\'s|female|ladies|lady|girl|girls)\b', msg):
            parsed["gender"] = "women"
        elif re.search(r'\b(unisex)\b', msg):
            parsed["gender"] = "unisex"

        # 5. Category Extraction
        if re.search(r'\b(shirt|shirts|t-shirt|tshirts|tee|tees|top|tops|blouse|poplin|linen shirt)\b', msg):
            parsed["category"] = "tops"
            parsed["keywords"].append("shirt")
        elif re.search(r'\b(dress|dresses|gown|gowns|slip|skirt|skirts)\b', msg):
            parsed["category"] = "dresses"
            parsed["keywords"].append("dress")
        elif re.search(r'\b(coat|coats|overcoat|trench|jacket|jackets|blazer|blazers|bomber|outerwear)\b', msg):
            parsed["category"] = "outerwear"
            parsed["keywords"].append("coat")
        elif re.search(r'\b(trouser|trousers|pant|pants|denim|jeans|bottoms|slacks)\b', msg):
            parsed["category"] = "trousers"
            parsed["keywords"].append("trouser")
        elif re.search(r'\b(knit|knitwear|sweater|sweaters|cardigan|cardigans|cashmere|turtleneck)\b', msg):
            parsed["category"] = "knitwear"
            parsed["keywords"].append("knit")
        elif re.search(r'\b(bag|bags|tote|purse|shoes|boots|sunglasses|eyewear|accessories)\b', msg):
            parsed["category"] = "accessories"
            parsed["keywords"].append("accessories")

        # 6. Occasion Extraction
        if re.search(r'\b(casual|everyday|relaxed|daily|streetwear)\b', msg):
            parsed["occasion"] = "casual"
            parsed["keywords"].extend(["cotton", "tee", "shirt", "denim", "relaxed"])
        elif re.search(r'\b(formal|evening|gala|party|wedding|cocktail|couture)\b', msg):
            parsed["occasion"] = "formal"
            parsed["keywords"].extend(["silk", "gown", "blazer", "dress", "wool"])
        elif re.search(r'\b(winter|cold|warm|heavyweight)\b', msg):
            parsed["occasion"] = "winter"
            parsed["keywords"].extend(["wool", "cashmere", "coat", "jacket"])

        return parsed

    @classmethod
    def get_product_recommendations(cls, message: str = "", limit: int = 4) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """
        Retrieves matching luxury products from Django PostgreSQL/SQLite Product model.
        Dynamically applies budget ranges, category, gender, availability, and occasion filters.
        Never fabricates product details or prices.
        """
        parsed = cls.parse_product_query(message)
        eff_limit = parsed.get("limit") or limit

        qs = Product.objects.all()

        # 1. Product Availability
        if parsed.get("only_unavailable"):
            qs = qs.filter(Q(in_stock=False) | Q(stock_quantity=0))
        else:
            qs = qs.filter(in_stock=True, stock_quantity__gt=0)

        # 2. Budget Bounds
        if parsed.get("budget_max") is not None:
            qs = qs.filter(price__lte=Decimal(str(parsed["budget_max"])))
        if parsed.get("budget_min") is not None:
            qs = qs.filter(price__gte=Decimal(str(parsed["budget_min"])))

        # 3. Category Filter
        if parsed.get("category"):
            qs = qs.filter(category__iexact=parsed["category"])

        # 4. Gender Filter (includes unisex items for male/female shoppers)
        if parsed.get("gender"):
            qs = qs.filter(Q(gender=parsed["gender"]) | Q(gender="unisex"))

        # 5. Occasion & Keywords Filter
        if parsed.get("keywords"):
            keyword_filter = Q()
            for kw in parsed["keywords"]:
                keyword_filter |= (
                    Q(name__icontains=kw) |
                    Q(description__icontains=kw) |
                    Q(category__icontains=kw) |
                    Q(brand__icontains=kw)
                )
            qs_kw = qs.filter(keyword_filter)
            # If keyword filter yields matches, apply it; otherwise keep broader category/budget results
            if qs_kw.exists():
                qs = qs_kw

        # 6. Sorting Order
        if parsed.get("budget_max") is not None:
            # Sort closest to budget or highest rating
            qs = qs.order_by("-price", "-rating")
        else:
            qs = qs.order_by("-is_featured", "-rating", "-price")

        products = list(qs[:eff_limit])
        product_dicts = [p.to_dict() for p in products]

        return product_dicts, parsed


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

