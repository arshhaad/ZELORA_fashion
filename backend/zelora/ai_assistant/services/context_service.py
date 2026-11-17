import re
from typing import Dict, Any, Optional, Tuple
from CUSTOMER.models import User
from .retrieval_service import RetrievalService, SecurityViolationError


class OffTopicQueryError(Exception):
    """Raised when a user asks a question unrelated to the ZELORA website."""
    def __init__(self, topic: str):
        self.topic = topic
        super().__init__(f"Off-topic query detected: {topic}")


class ContextService:
    """
    Identifies query intent and builds authorized, role-bounded system prompts
    and context bundles for the LLM.
    """

    ZELORA_DOMAIN_TERMS = [
        "zelora", "website", "storefront", "atelier", "boutique", "concierge", "marketplace",
        "catalog", "catalogue", "collection", "new arrivals", "special offer", "coupon", "discount", "promo",
        "product", "products", "producrt", "garment", "garments", "cloth", "clothes", "clothing",
        "outfit", "outfits", "apparel", "attire", "dress", "dresses", "gown", "gowns",
        "shirt", "shirts", "t-shirt", "tshirt", "tshirts", "tee", "tees", "top", "tops",
        "trouser", "trousers", "pant", "pants", "jeans", "coat", "overcoat", "trench",
        "jacket", "jackets", "blazer", "suit", "knit", "knitwear", "sweater", "cashmere",
        "silk", "wool", "cotton", "linen", "leather", "shoe", "shoes", "boot", "boots",
        "bag", "bags", "handbag", "jewelry", "jewellery", "accessory", "accessories",
        "men", "mens", "men's", "women", "womens", "women's", "unisex", "size", "sizes", "sizing",
        "color", "colour", "fit", "style", "styling", "casual", "formal", "evening", "gala",
        "fashion", "wear", "cart", "wishlist", "checkout", "budget", "price", "cost",
        "stock", "available", "unavailable", "out of stock", "sold out",
        "order", "orders", "track", "tracking", "delivery", "deliver", "shipping", "shipped",
        "return", "returns", "refund", "exchange", "payment", "pay", "paid", "upi", "razorpay",
        "address", "addresses", "account", "profile", "login", "logout", "register", "signup",
        "password", "otp", "policy", "policies", "support", "faq",
        "seller", "vendor", "shop", "sales", "revenue", "gmv", "commission", "payout", "payouts",
        "inventory", "dashboard", "admin", "administrator", "users", "customers", "approvals",
        "analytics", "stats", "statistics", "report", "reports", "ticket", "tickets",
    ]

    OFF_TOPIC_PATTERNS = [
        # Programming & tech
        "react", "reactjs", "react js", "nextjs", "next.js", "vue", "vuejs", "angular", "svelte",
        "javascript", "typescript", "python", "java", "c++", "c#", "golang", "rust", "php", "ruby",
        "swift", "kotlin", "html", "css", "tailwind", "bootstrap", "nodejs", "node.js",
        "django", "flask", "fastapi", "spring boot", "sql", "mysql", "postgresql", "mongodb",
        "redis", "docker", "kubernetes", "git", "github", "linux", "ubuntu", "vscode",
        "coding", "programming", "algorithm", "data structure", "leetcode", "machine learning",
        "deep learning", "blockchain", "web3", "crypto", "bitcoin", "ethereum", "chatgpt", "openai",
        "software", "compiler", "database", "tutorial", "code",
        # General trivia / non-website
        "weather", "temperature", "forecast", "cricket", "football", "soccer", "ipl", "fifa",
        "world cup", "nba", "tennis", "movie", "movies", "film", "anime", "netflix", "song",
        "lyrics", "recipe", "cooking", "biryani", "pizza", "pasta", "politics", "election",
        "president", "prime minister", "stock market", "nifty", "sensex", "forex", "homework",
        "essay", "physics", "chemistry", "biology", "photosynthesis", "calculus", "algebra",
        "geometry", "trigonometry", "geography", "capital of", "mars", "moon", "universe",
        "black hole", "horoscope", "astrology", "medicine", "disease", "symptom", "doctor", "joke",
    ]

    @classmethod
    def _has_domain_term(cls, msg: str) -> bool:
        for term in cls.ZELORA_DOMAIN_TERMS:
            if re.search(rf'\b{re.escape(term)}\b', msg):
                return True
        if re.search(r'\b\d+\s*(?:rs|inr|rupees)\b', msg) or re.search(r'₹\s*\d+', msg):
            return True
        return False

    @classmethod
    def _extract_topic(cls, message: str, matched_term: Optional[str] = None) -> str:
        cleaned = re.sub(r'[?!.]+$', '', message.strip())
        prefixes = [
            r'^can you tell me about\s+',
            r'^can you explain\s+',
            r'^tell me about\s+',
            r'^what do you know about\s+',
            r'^what is the\s+',
            r'^what is a\s+',
            r'^what is an\s+',
            r'^what is\s+',
            r'^what are\s+',
            r'^who is\s+',
            r'^who are\s+',
            r'^explain\s+',
            r'^define\s+',
            r'^give me\s+',
            r'^show me\s+',
            r'^how to\s+',
            r'^how does\s+',
            r'^how do\s+',
            r'^write\s+',
        ]
        topic = cleaned
        for p in prefixes:
            topic = re.sub(p, '', topic, flags=re.IGNORECASE).strip()

        if not topic or len(topic) > 45:
            topic = matched_term or "this topic"

        # Capitalize nicely if lowercase single/short phrase
        if topic.islower():
            topic = topic.title() if len(topic.split()) <= 3 else topic
        return topic

    @classmethod
    def detect_off_topic(cls, message: str) -> Optional[str]:
        """
        Deterministically detects clearly off-topic queries unrelated to the ZELORA website
        and returns the extracted topic name. Returns None if on-topic or conversational.
        """
        msg = message.lower().strip()
        if not msg:
            return None

        # Never flag queries that mention ZELORA website / fashion / shopping / order / seller / admin terms
        if cls._has_domain_term(msg):
            return None

        # Pure math expressions like "2 + 2" or "what is 15 * 4"
        if re.search(r'\b\d+\s*[\+\-\*\/]\s*\d+\b', msg):
            return "math calculations"

        for term in cls.OFF_TOPIC_PATTERNS:
            if re.search(rf'\b{re.escape(term)}\b', msg):
                return cls._extract_topic(message, matched_term=term)

        return None

    @classmethod
    def identify_intent(cls, message: str) -> str:
        msg = message.lower().strip()

        # Security/Forbidden Probing
        if any(term in msg for term in [
            "other user", "another customer", "all orders in database",
            "select * from", "raw sql", "database schema", "api key", "passwords"
        ]):
            return "security_probe"

        # Admin Intent
        if any(term in msg for term in [
            "revenue", "marketplace", "platform sales", "platform revenue", "gmv",
            "how many users", "how many sellers", "how many customers", "admin report", "pending approvals"
        ]):
            return "admin_analytics"

        # Seller Intent
        if any(term in msg for term in [
            "my shop", "my products", "my sales", "units sold", "how many items sold",
            "seller orders", "boutique status"
        ]):
            return "seller_analytics"

        # Customer Cart & Shopping Bag
        if any(term in msg for term in [
            "how many item in cart", "how many items in cart", "item in cart", "items in cart",
            "cart count", "in my cart", "my cart", "cart items", "shopping bag", "in my bag",
            "how many in cart"
        ]):
            return "customer_cart"

        # Customer Order Tracking & History
        if any(term in msg for term in [
            "where is my order", "track my order", "order status", "latest order",
            "when will my order arrive", "shipping status", "tracking"
        ]):
            return "customer_order_status"

        if any(term in msg for term in [
            "my orders", "previous orders", "order history", "how many orders",
            "list my orders", "past orders"
        ]):
            return "customer_order_history"

        # Customer Payment Status
        if any(term in msg for term in [
            "is my payment successful", "payment status", "did my payment go through",
            "payment method", "refund"
        ]):
            return "customer_payment_status"

        # Customer Addresses
        if any(term in msg for term in [
            "my address", "saved addresses", "shipping address", "delivery address"
        ]):
            return "customer_address"

        # Product Recommendations & Shopping Advice
        product_terms = [
            "recommend", "recommendation", "suggestion", "suggest", "style", "outfit",
            "wool overcoat", "gown", "gowns", "dress", "dresses", "trench", "cashmere",
            "shoes", "jacket", "jackets", "pants", "trouser", "trousers", "boots", "bag", "bags",
            "shirt", "shirts", "tee", "tees", "t-shirt", "tshirts", "top", "tops",
            "collection", "piece", "pieces", "buy", "product", "products", "producrt", "garment",
            "garments", "item", "items", "clothes", "clothing", "wear", "look", "catalog",
            "budget", "affordable", "cheap", "under", "below", "between", "price", "cost",
            "give me", "show me", "what should i wear", "casual", "formal", "evening",
            "unavailable", "out of stock", "sold out"
        ]
        if any(term in msg for term in product_terms):
            return "product_recommendation"

        if re.search(r'\b\d+\s*(?:rs|inr|rupees)\b', msg) or re.search(r'₹\s*\d+', msg):
            return "product_recommendation"

        return "general_concierge"

    @classmethod
    def build_user_context(cls, user: User, message: str, past_messages: list = None, cart_count: Optional[int] = None) -> Tuple[str, Dict[str, Any], str]:
        """
        Builds the authorized context and prompt.
        Returns: (system_prompt, telemetry_metadata, detected_intent)
        """
        # 1. First enforce tenant isolation check
        if RetrievalService.detect_unauthorized_cross_tenant_intent(message, user):
            raise SecurityViolationError(
                "Access Denied: You are not authorized to view or request records belonging to other accounts."
            )

        # 2. Enforce strict ZELORA website scope (reject unrelated topics)
        off_topic = cls.detect_off_topic(message)
        if off_topic:
            raise OffTopicQueryError(off_topic)

        intent = cls.identify_intent(message)
        first_name = user.first_name or user.email.split('@')[0].capitalize()
        role_label = "Administrator" if (user.is_staff or user.is_superuser) else ("Boutique Seller" if user.is_seller else "Customer")

        # Base Persona
        system_prompt = (
            f"You are the official ZELORA Luxury AI Assistant for the ZELORA website.\n"
            f"Current Authenticated User: {first_name} ({user.email}).\n"
            f"User Role: {role_label}.\n"
            f"Currency Standard: Indian Rupees (₹).\n\n"
            f"STRICT WEBSITE-ONLY SCOPE POLICY:\n"
            f"- You ONLY answer questions related to the ZELORA website: products, fashion, styling, orders, cart, tracking, shipping, payments, addresses, and platform analytics.\n"
            f"- If the user asks about ANY off-topic subject (coding, weather, sports, movies, cooking, math, trivia, general knowledge):\n"
            f"  Reply ONLY: \"Sorry, we can't provide information about <topic>. Please ask something related to ZELORA.\"\n\n"
            f"CRITICAL ULTRA-SHORT RESPONSE DIRECTIVES (MANDATORY - HIGHEST PRIORITY):\n"
            f"- Provide ONLY EXTREMELY SHORT, DIRECT ANSWERS (1 to 5 WORDS MAXIMUM).\n"
            f"- NO greetings, NO pleasantries, NO conversational filler ('Hello', 'Welcome back', 'Our records show', 'I would be happy to', etc.). Get straight to the answer.\n"
            f"- Users need answers they can grasp immediately in 1 second.\n"
            f"- EXACT REQUIRED ANSWER EXAMPLES:\n"
            f"  • User: 'where is my order ?' -> Answer: 'Shipped' (or 'Processing' / 'Delivered' / 'No active orders')\n"
            f"  • User: 'how many item in cart ?' -> Answer: '2' (or '2 items' / 'Empty')\n"
            f"  • User: 'how many orders have I placed?' -> Answer: '3 orders'\n"
            f"  • User: 'is my payment successful?' -> Answer: 'Yes, Paid' (or 'Pending')\n"
            f"  • User: 'saved address' -> Answer: 'Flat 4B, Grand Atelier, Mumbai'\n"
            f"  • User: 'recommend an evening gown' -> Answer: 'Here are our top evening gowns:'\n"
            f"  • User: 'platform revenue' -> Answer: '₹12,45,000 (34 orders)'\n"
            f"  • User: 'shop sales' -> Answer: '₹85,000 (12 items sold)'\n"
            f"  • User: 'hi / hello' -> Answer: 'Hi! How can I help?'\n"
            f"- Never write paragraphs, full multi-sentence explanations, or conversational fluff.\n"
            f"- Ground truth: Strictly use only the verified records provided below.\n\n"
        )

        retrieved_data = {}

        # 2. Fetch role-specific authorized data based on intent
        if intent == "customer_cart":
            count = cart_count if cart_count is not None else 0
            retrieved_data["cart_count"] = count
            system_prompt += (
                f"--- LIVE SHOPPING CART DATA ---\n"
                f"Items in Cart: {count}\n"
                f"-------------------------------\n"
                f"DIRECTIVE: Answer ONLY with the number (e.g. '{count}' or '{count} items').\n\n"
            )

        elif intent in ["customer_order_status", "customer_payment_status"]:
            latest_order = RetrievalService.get_customer_latest_order(user)
            retrieved_data["latest_order"] = latest_order
            if latest_order:
                system_prompt += (
                    f"--- VERIFIED LIVE ORDER RECORD ---\n"
                    f"Order ID: {latest_order['order_id']}\n"
                    f"Order Date: {latest_order['date']}\n"
                    f"Status: {latest_order['status']}\n"
                    f"Payment Status: {latest_order['payment_status']} (via {latest_order['payment_method']})\n"
                    f"Total Amount: {latest_order['total_amount']}\n"
                    f"Estimated Delivery: {latest_order['estimated_delivery']}\n"
                    f"Tracking Number: {latest_order['tracking_number']}\n"
                    f"Items: {', '.join(latest_order['items'])}\n"
                    f"-----------------------------------\n"
                    f"DIRECTIVE: Answer ONLY the status (e.g. '{latest_order['status'].title()}'). If they ask about payment, answer ONLY the payment status (e.g. 'Paid via {latest_order['payment_method']}').\n\n"
                )
            else:
                system_prompt += (
                    f"--- VERIFIED LIVE ORDER RECORD ---\n"
                    f"User has not placed any orders yet on ZELORA.\n"
                    f"-----------------------------------\n"
                    f"DIRECTIVE: Answer ONLY: 'No active orders'.\n\n"
                )

        elif intent == "customer_order_history":
            orders = RetrievalService.get_customer_orders_summary(user, limit=5)
            stats = RetrievalService.get_customer_stats(user)
            retrieved_data["orders"] = orders
            retrieved_data["stats"] = stats
            system_prompt += (
                f"--- VERIFIED ORDER HISTORY ---\n"
                f"Total Orders Count: {stats['total_orders']}\n"
                f"Total Spend: {stats['total_spent']}\n"
            )
            if orders:
                for idx, o in enumerate(orders, 1):
                    system_prompt += (
                        f"{idx}. Order #{o['order_id']} | Date: {o['date']} | Status: {o['status']} | Amount: {o['total_amount']} | "
                        f"Items: {', '.join(o['items'])}\n"
                    )
            else:
                system_prompt += "User currently has no recorded orders.\n"
            system_prompt += f"------------------------------\n\n"

        elif intent == "customer_address":
            addresses = RetrievalService.get_customer_addresses(user)
            retrieved_data["addresses"] = addresses
            system_prompt += f"--- VERIFIED SAVED ADDRESSES ---\n"
            if addresses:
                for a in addresses:
                    system_prompt += f"- {a['type']} ({'Default' if a['is_default'] else 'Alternative'}): {a['full_name']}, {a['line']}, {a['city']}, {a['state']} - {a['pin_code']}\n"
            else:
                system_prompt += "No delivery addresses saved yet in profile.\n"
            system_prompt += f"-------------------------------\n\n"

        elif intent == "seller_analytics":
            if not user.is_seller:
                system_prompt += "Notice: The user asked about seller metrics, but their account is registered as a Customer. Politely inform them they do not hold an active vendor atelier account.\n"
            else:
                shop_info = RetrievalService.get_seller_shop_details(user)
                sales_info = RetrievalService.get_seller_orders_and_sales(user)
                retrieved_data["shop"] = shop_info
                retrieved_data["sales"] = sales_info
                system_prompt += (
                    f"--- VERIFIED VENDOR ATELIER DATA ---\n"
                    f"Boutique Name: {shop_info['name'] if shop_info else user.shop_name}\n"
                    f"Storefront Status: {'Active & Open' if (shop_info and shop_info['is_open']) else 'Paused'}\n"
                    f"Total Units Sold: {sales_info['total_units_sold'] if sales_info else 0}\n"
                    f"Sales Volume: {sales_info['estimated_sales_volume'] if sales_info else '₹0.00'}\n"
                    f"------------------------------------\n\n"
                )

        elif intent == "admin_analytics":
            if not (user.is_staff or user.is_superuser):
                raise SecurityViolationError("Access Denied: Administrative metrics are restricted to platform superusers.")
            metrics = RetrievalService.get_admin_marketplace_metrics(user)
            retrieved_data["admin_metrics"] = metrics
            system_prompt += (
                f"--- PLATFORM EXECUTIVE TELEMETRY (RESTRICTED ADMIN DATA) ---\n"
                f"Gross Merchandise Volume (GMV): {metrics['platform_gross_merchandise_volume']}\n"
                f"Estimated Platform Net Commission: {metrics['platform_net_commission_revenue']}\n"
                f"Total Orders: {metrics['total_orders_placed']}\n"
                f"Total Registered Users: {metrics['total_registered_users']} ({metrics['total_customers']} Customers, {metrics['total_sellers']} Sellers)\n"
                f"Total Boutique Shops: {metrics['total_boutique_shops']} (Pending Approvals: {metrics['pending_boutique_approvals']})\n"
                f"Pending Payout Requests: {metrics['pending_seller_payout_requests']}\n"
                f"Open Concierge Tickets: {metrics['open_support_tickets']}\n"
                f"-----------------------------------------------------------\n\n"
            )

        elif intent == "product_recommendation":
            search_query = message
            if past_messages:
                recent_user_msgs = [m['content'] for m in past_messages if m.get('role') == 'user']
                if recent_user_msgs and len(message.split()) <= 6:
                    search_query = f"{recent_user_msgs[-1]} {message}"

            products, parsed_query = RetrievalService.get_product_recommendations(search_query)
            retrieved_data["products"] = products
            retrieved_data["query_meta"] = parsed_query

            if products:
                prod_summary = "\n".join([
                    f"{i+1}. ID: {p['id']} | Name: {p['name']} | Price: ₹{p['price']} | Category: {p['category']} | Gender: {p['gender']} | Status: {'In Stock' if p['in_stock'] else 'Unavailable'}\n   Description: {p['description']}"
                    for i, p in enumerate(products)
                ])
                system_prompt += (
                    f"--- VERIFIED LIVE DATABASE PRODUCTS (GROUND TRUTH) ---\n"
                    f"Found {len(products)} matching piece(s):\n"
                    f"{prod_summary}\n"
                    f"-------------------------------------------------------\n"
                    f"DIRECTIVE FOR PRODUCT RECOMMENDATIONS:\n"
                    f"- Give ONLY a very brief, elegant response (strictly 1 to 2 sentences maximum).\n"
                    f"- Politely introduce the curated pieces.\n"
                    f"- NEVER invent fake products, models, or prices.\n"
                    f"- Do NOT output markdown bullet lists of product names or descriptions in text — the frontend will automatically render rich interactive cards with photos, prices, 'View Piece', and 'Add to Cart' buttons below your message.\n\n"
                )
            else:
                budget_max = parsed_query.get("budget_max")
                if budget_max is not None:
                    system_prompt += (
                        f"--- VERIFIED LIVE DATABASE PRODUCTS (EMPTY RESULT) ---\n"
                        f"No products in the database match the requested budget (₹{budget_max:,.0f}).\n"
                        f"The lowest-priced luxury garment in the ZELORA catalog starts at ₹110.\n"
                        f"-------------------------------------------------------\n"
                        f"DIRECTIVE: In strictly 1 friendly sentence, inform the user that ZELORA currently does not have pieces under ₹{budget_max:,.0f}, and that our curated collection begins at ₹110.\n\n"
                    )
                elif parsed_query.get("only_unavailable"):
                    system_prompt += (
                        f"--- VERIFIED LIVE DATABASE PRODUCTS (EMPTY RESULT) ---\n"
                        f"All pieces in the atelier are currently in stock.\n"
                        f"-------------------------------------------------------\n"
                        f"DIRECTIVE: In strictly 1 sentence, inform the user that all items are currently in stock.\n\n"
                    )
                else:
                    system_prompt += (
                        f"--- VERIFIED LIVE DATABASE PRODUCTS (EMPTY RESULT) ---\n"
                        f"No products matched the exact criteria in our atelier catalog.\n"
                        f"-------------------------------------------------------\n"
                        f"DIRECTIVE: In strictly 1 sentence, politely let the user know and invite them to explore our main collection.\n\n"
                    )

        return system_prompt, retrieved_data, intent
