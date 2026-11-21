import re
from decimal import Decimal
from typing import Dict, Any, List, Tuple
from django.db.models import Sum, Count, Q, Min, Max
from CUSTOMER.models import Order, OrderItem, Address, SellerShop, User, Product, Notification
from ADMIN.models import SupportTicket, SellerPayoutRequest, PlatformCoupon


class SecurityViolationError(Exception):
    """Raised when an unauthorized data access attempt is detected."""
    pass


class RetrievalService:
    """
    Deterministic, role-bounded database retrieval service.
    Guarantees zero unrestricted AI-generated SQL and strictly isolates user records.
    Never trusts parameters sent from the frontend.
    """

    @classmethod
    def parse_product_query(cls, message: str) -> Dict[str, Any]:
        """
        Extracts structured shopping filters and search phrases from natural language queries.
        Supports budget ranges, specific prices, gender, category, availability, occasion, counts,
        and clean title/keyword terms for direct catalog searching.
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
            "clean_query": "",
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
        elif re.search(r'\b(dress|dresses|gown|gowns|gwon|slip|skirt|skirts)\b', msg):
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

        # 7. Extract Clean Search Phrase for Direct Product Name Searching
        noise_patterns = [
            r'\bhow\s+much\s+(?:is|are|for)\b',
            r'\bwhat\s+is\s+the\s+price\s+of\b',
            r'\bprice\s+of\b',
            r'\bcost\s+of\b',
            r'\bdo\s+you\s+have\b',
            r'\bis\b',
            r'\bare\b',
            r'\bin\s+stock\b',
            r'\bavailable\b',
            r'\bout\s+of\s+stock\b',
            r'\bsold\s+out\b',
            r'\bdetails\s+of\b',
            r'\btell\s+me\s+about\b',
            r'\bshow\s+me\b',
            r'\brecommend\b',
            r'\bcan\s+i\s+(?:buy|get)\b',
            r'\bplease\b',
            r'\bzelora\b',
            r'\batelier\b',
            r'\bproduct\b',
            r'\bpiece\b',
        ]
        cleaned = msg
        for np in noise_patterns:
            cleaned = re.sub(np, ' ', cleaned)
        cleaned = re.sub(r'[^a-z0-9\s\-]', ' ', cleaned)
        stop_words = {'the', 'a', 'an', 'for', 'and', 'with', 'in', 'to', 'of', 'any', 'some'}
        words = [w for w in cleaned.split() if w not in stop_words and len(w) > 1]
        parsed["clean_query"] = ' '.join(words)

        return parsed

    @classmethod
    def get_product_recommendations(cls, message: str = "", limit: int = 4) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """
        Retrieves matching luxury products from Django PostgreSQL/SQLite Product model.
        Leverages Redis caching for repeated search requests.
        Accurately handles specific product inquiries (name, price, stock status),
        budget bounds, categories, genders, and availability.
        """
        parsed = cls.parse_product_query(message)
        eff_limit = parsed.get("limit") or limit
        clean_text = parsed.get("clean_query", "").strip()

        # Check for specific product name match in the database first
        if len(clean_text) >= 2:
            # 1. Exact or Substring Name match
            matched_prods = Product.objects.filter(name__icontains=clean_text)
            if not matched_prods.exists():
                # Try matching by slug
                slug_candidate = clean_text.replace(' ', '-')
                matched_prods = Product.objects.filter(slug__icontains=slug_candidate)

            if not matched_prods.exists():
                # Tokenized search across product name, brand, description
                tokens = [t for t in clean_text.split() if len(t) > 2]
                if tokens:
                    q_token = Q()
                    for t in tokens:
                        q_token |= Q(name__icontains=t) | Q(brand__icontains=t) | Q(category__icontains=t)
                    matched_prods = Product.objects.filter(q_token)

            if matched_prods.exists():
                parsed["specific_inquiry"] = True
                products = list(matched_prods[:eff_limit])
                product_dicts = [p.to_dict() for p in products]
                return product_dicts, parsed

        # Redis Cache Lookup for General Recommendation Queries
        from django.core.cache import cache
        cache_key = f"zelora:products:{parsed.get('gender')}:{parsed.get('category')}:{parsed.get('budget_max')}:{parsed.get('budget_min')}:{parsed.get('only_unavailable')}:{parsed.get('occasion')}:{eff_limit}"
        try:
            cached_result = cache.get(cache_key)
            if cached_result is not None:
                return cached_result, parsed
        except Exception:
            pass

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
            if qs_kw.exists():
                qs = qs_kw

        # 6. Sorting Order
        if parsed.get("budget_max") is not None:
            qs = qs.order_by("-price", "-rating")
        else:
            qs = qs.order_by("-is_featured", "-rating", "-price")

        products = list(qs[:eff_limit])
        product_dicts = [p.to_dict() for p in products]

        # Store in Redis Cache with 3-minute TTL
        try:
            cache.set(cache_key, product_dicts, timeout=180)
        except Exception:
            pass

        return product_dicts, parsed

    @classmethod
    def get_catalog_overview(cls) -> Dict[str, Any]:
        """
        Provides aggregate catalog telemetry directly from the live database.
        """
        total_count = Product.objects.count()
        in_stock_count = Product.objects.filter(in_stock=True).count()
        raw_cats = Product.objects.exclude(category__isnull=True).exclude(category='').values_list('category', flat=True)
        unique_cats = sorted({c.strip().title() for c in raw_cats if c and c.strip()})
        raw_brands = Product.objects.exclude(brand__isnull=True).exclude(brand='').values_list('brand', flat=True)
        unique_brands = sorted({b.strip() for b in raw_brands if b and b.strip()})[:10]
        min_max = Product.objects.filter(in_stock=True).aggregate(
            min_p=Min('price'),
            max_p=Max('price')
        )
        cheapest = Product.objects.filter(in_stock=True).order_by('price').first()
        priciest = Product.objects.filter(in_stock=True).order_by('-price').first()

        return {
            "total_products": total_count,
            "in_stock_products": in_stock_count,
            "categories": unique_cats,
            "brands": unique_brands,
            "min_price": float(min_max['min_p']) if min_max['min_p'] is not None else 0.0,
            "max_price": float(min_max['max_p']) if min_max['max_p'] is not None else 0.0,
            "cheapest_product": cheapest.name if cheapest else None,
            "most_expensive_product": priciest.name if priciest else None
        }

    @staticmethod
    def detect_unauthorized_cross_tenant_intent(message: str, user: User) -> bool:
        """
        Analyzes message for attempts to query other users' private records.
        """
        lower = message.lower()
        cross_user_patterns = [
            r"\b(?:other|another)\s+(?:user|customer|seller|client|buyer)'s?\s+orders?\b",
            r"\bsomeone\s+else's?\s+(?:order|sale|product|address|money)\b",
            r"\borders?\s+(?:of|for|belonging\s+to)\s+(?:user|id|customer|another)\b",
            r"\bshow\s+me\s+all\s+users\b",
            r"\ball\s+customers?\s+(?:list|records|orders)\b",
            r"\bpasswords?\b",
            r"\bapi\s+key\b",
            r"\bsecret\s+key\b",
            r"\bdatabase\s+dump\b",
            r"\braw\s+sql\b",
        ]

        if not (user.is_staff or user.is_superuser):
            for pat in cross_user_patterns:
                if re.search(pat, lower):
                    return True
        return False

    @staticmethod
    def get_customer_order(user: User, message: str = ""):
        """
        Retrieves a specific order if an order ID is detected in the message,
        or falls back to the customer's latest order from the database.
        """
        order = None
        if message:
            id_match = re.search(r'\b(ORD-[A-Za-z0-9\-]+|ZEL-[A-Za-z0-9\-]+|\d{4,})\b', message, re.IGNORECASE)
            if id_match:
                order_id_query = id_match.group(1).strip()
                order = Order.objects.filter(user=user, order_id__iexact=order_id_query).prefetch_related('items').first()
                if not order:
                    order = Order.objects.filter(user=user, order_id__icontains=order_id_query).prefetch_related('items').first()

        if not order:
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
            "tracking_number": order.tracking_number or "Pending courier assignment",
            "delivery_method": order.delivery_method,
            "items": [it.product_name for it in order.items.all()],
            "items_detailed": [
                f"{it.product_name} (Qty: {it.quantity}, ₹{it.price})"
                for it in order.items.all()
            ]
        }

    @staticmethod
    def get_customer_latest_order(user: User):
        """
        Retrieves latest order for the authenticated user.
        """
        return RetrievalService.get_customer_order(user, "")

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
    def get_customer_addresses(user: User):
        """
        Retrieves addresses belonging to the authenticated user.
        """
        addresses = Address.objects.filter(user=user).order_by('-is_default', '-created_at')[:5]
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

    @staticmethod
    def get_user_profile(user: User) -> Dict[str, Any]:
        """
        Retrieves verified account details for the authenticated user.
        """
        role_label = "Administrator" if (user.is_staff or user.is_superuser) else ("Boutique Seller" if user.is_seller else "Customer")
        name = user.get_full_name() or user.first_name or user.email.split('@')[0].capitalize()
        return {
            "name": name,
            "email": user.email,
            "phone_number": getattr(user, 'phone_number', None) or "Not registered",
            "role": role_label,
            "is_email_verified": user.is_email_verified,
            "date_joined": user.date_joined.strftime("%b %d, %Y") if user.date_joined else "Recent",
            "shop_name": getattr(user, 'shop_name', None) if user.is_seller else None
        }

    @staticmethod
    def get_customer_notifications(user: User, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Retrieves notifications addressed to the authenticated user from the database.
        """
        notifs = Notification.objects.filter(user=user).order_by('-created_at')[:limit]
        return [
            {
                "id": n.id,
                "title": n.title,
                "description": n.description,
                "category": n.category,
                "is_read": n.is_read,
                "date": n.created_at.strftime("%b %d, %Y")
            }
            for n in notifs
        ]

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
        shop_name = shop.name if shop else (user.shop_name or "Atelier")

        items_qs = OrderItem.objects.filter(brand__iexact=shop_name)
        total_items_sold = items_qs.aggregate(total_qty=Sum('quantity'))['total_qty'] or 0
        total_sales_volume = items_qs.aggregate(volume=Sum('price'))['volume'] or 0.00

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

    @staticmethod
    def get_seller_products(user: User) -> Dict[str, Any]:
        """
        Retrieves catalog products belonging to this seller's boutique brand.
        """
        if not user.is_seller:
            return None
        shop = SellerShop.objects.filter(owner=user).first()
        shop_name = shop.name if shop else (user.shop_name or "Atelier")
        prods = Product.objects.filter(brand__iexact=shop_name)
        if not prods.exists():
            prods = Product.objects.filter(brand__icontains=shop_name)

        prod_list = [
            {
                "id": p.id,
                "name": p.name,
                "category": p.category,
                "price": float(p.price),
                "stock_quantity": p.stock_quantity,
                "in_stock": p.in_stock,
                "rating": float(p.rating)
            }
            for p in prods[:10]
        ]
        return {
            "shop_name": shop_name,
            "total_products": prods.count(),
            "in_stock_products": prods.filter(in_stock=True).count(),
            "products": prod_list
        }

    # =========================================================================
    # ADMIN-SCOPED RETRIEVAL
    # =========================================================================
    @staticmethod
    def get_admin_marketplace_metrics(user: User):
        """
        Only executable by verified staff / superuser administrators.
        Leverages Redis caching for aggregate calculations.
        """
        if not (user.is_staff or user.is_superuser):
            raise SecurityViolationError("Access denied: Administrative privileges required.")

        from django.core.cache import cache
        cache_key = "zelora:admin:marketplace_metrics"
        try:
            cached_metrics = cache.get(cache_key)
            if cached_metrics is not None:
                return cached_metrics
        except Exception:
            pass

        total_sales_aggr = Order.objects.aggregate(total=Sum('total_amount'))['total'] or 0.00
        total_orders = Order.objects.count()
        total_users = User.objects.count()
        total_customers = User.objects.filter(is_seller=False, is_staff=False).count()
        total_sellers = User.objects.filter(is_seller=True).count()
        total_shops = SellerShop.objects.count()
        pending_shops = SellerShop.objects.filter(is_open=False).count()
        pending_payouts = SellerPayoutRequest.objects.filter(status='pending').count()
        open_tickets = SupportTicket.objects.filter(status__in=['open', 'in_progress']).count()
        total_products = Product.objects.count()
        in_stock_products = Product.objects.filter(in_stock=True).count()
        active_coupons = PlatformCoupon.objects.filter(is_active=True).count()

        metrics = {
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
            "total_products_in_catalog": total_products,
            "in_stock_products": in_stock_products,
            "active_coupons": active_coupons,
        }

        try:
            cache.set(cache_key, metrics, timeout=60)
        except Exception:
            pass

        return metrics
