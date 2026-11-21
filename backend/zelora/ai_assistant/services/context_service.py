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
        "outfit", "outfits", "apparel", "attire", "dress", "dresses", "gown", "gowns", "gwon",
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
        "notification", "notifications", "brand", "brands", "category", "categories",
        "email", "phone", "name", "who am i",
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
        """
        Extracts structured intent with strict word-boundary matching.
        Evaluates specific data requests (addresses, orders, profile, catalog)
        before general clothing and keyword recommendations.
        """
        msg = message.lower().strip()

        # 1. Security / Forbidden Probing
        sec_patterns = [
            r"\b(?:other|another)\s+(?:user|customer|seller|account|buyer)'s?\b",
            r"\ball\s+orders\s+in\s+database\b",
            r"\bselect\s+\*\s+from\b",
            r"\braw\s+sql\b",
            r"\bdatabase\s+schema\b",
            r"\b(?:api|secret)\s+keys?\b",
            r"\bpasswords?\b",
            r"\bdatabase\s+dump\b"
        ]
        for pat in sec_patterns:
            if re.search(pat, msg):
                return "security_probe"

        # 2. Customer Saved Addresses (Evaluate before dresses/products!)
        if re.search(r'\baddress(?:es)?\b', msg):
            return "customer_address"

        # 3. Customer Cart / Shopping Bag
        cart_patterns = [
            r'\b(?:cart|shopping\s+bag|in\s+my\s+bag|bag\s+items?)\b',
            r'\b(?:how\s+many\s+items?|item\s+count|items?\s+in\s+(?:the\s+)?cart|item\s+in\s+cart)\b',
            r'\b(?:how\s+many\s+(?:in|item\s+in|items?\s+in)\s+(?:the\s+|my\s+)?(?:cart|bag))\b',
            r'\b(?:in\s+my\s+cart|my\s+cart|cart\s+items?|cart\s+count)\b',
            r'\b(?:what\s+is\s+in\s+(?:my\s+)?cart|what\s+do\s+i\s+have\s+in\s+cart)\b',
        ]
        if any(re.search(pat, msg) for pat in cart_patterns):
            if not re.search(r'\border\b', msg):
                return "customer_cart"

        # 4. User Profile & Account Details
        if re.search(r'\b(?:my\s+profile|my\s+email|what\s+is\s+my\s+email|what\s+is\s+my\s+name|my\s+phone(?:\s*number)?|my\s+account(?:\s*details)?|who\s+am\s+i|my\s+registered\s+(?:email|phone|name))\b', msg):
            return "user_profile"

        # 5. Customer Notifications
        if re.search(r'\b(?:my\s+notifications?|any\s+notifications?|do\s+i\s+have\s+(?:any\s+)?notifications?|show\s+notifications?|unread\s+notifications?|alerts)\b', msg):
            return "customer_notifications"

        # 6. Customer Specific Order / Order Tracking (e.g., ORD-xxx, track my order, where is my order)
        if re.search(r'\b(?:where\s+is\s+my\s+order|track\s+(?:my\s+)?order|order\s+status|latest\s+order|when\s+will\s+my\s+order\s+arrive|shipping\s+status|tracking\s+number)\b', msg) or re.search(r'\b(?:ord-[a-z0-9\-]+|zel-[a-z0-9\-]+)\b', msg):
            return "customer_order_status"

        # 7. Customer Order History
        if re.search(r'\b(?:my\s+orders?|previous\s+orders?|order\s+history|how\s+many\s+orders(?:\s+have\s+i\s+placed)?|list\s+my\s+orders?|past\s+orders?|what\s+did\s+i\s+order|items?\s+in\s+my\s+order)\b', msg):
            return "customer_order_history"

        # 8. Customer Payment Status
        if re.search(r'\b(?:is\s+my\s+payment\s+successful|payment\s+status|did\s+my\s+payment\s+go\s+through|payment\s+method|how\s+did\s+i\s+pay|refund\s+status)\b', msg):
            return "customer_payment_status"

        # 9. Admin Platform Metrics
        if re.search(r'\b(?:platform\s+revenue|total\s+revenue|marketplace\s+sales|platform\s+sales|gmv|how\s+many\s+users|how\s+many\s+sellers|how\s+many\s+customers|admin\s+report|pending\s+approvals?|pending\s+payouts?|open\s+tickets?)\b', msg):
            return "admin_analytics"

        # 10. Seller Specific Inquiries
        if re.search(r'\b(?:my\s+products?|what\s+products?\s+do\s+i\s+have|list\s+my\s+products?|items?\s+in\s+my\s+(?:boutique|shop)|inventory\s+count)\b', msg):
            return "seller_products"

        if re.search(r'\b(?:my\s+shop|my\s+sales|units\s+sold|how\s+many\s+items?\s+sold|seller\s+orders|boutique\s+status)\b', msg):
            return "seller_analytics"

        # 11. Catalog Overview & Aggregate Stats
        if re.search(r'\b(?:how\s+many\s+products|total\s+products|product\s+count|catalog\s+size|what\s+categories|list\s+categories|what\s+brands|brands\s+available|cheapest\s+product|most\s+expensive\s+product|price\s+range)\b', msg):
            return "catalog_overview"

        # 12. Specific Product Price / Availability Inquiry
        if re.search(r'\b(?:how\s+much\s+is|what\s+is\s+the\s+price\s+of|price\s+of|cost\s+of|is\s+.+\s+(?:in\s+stock|available|out\s+of\s+stock|sold\s+out)|do\s+you\s+have\s+.+\s+in\s+stock|details\s+of)\b', msg):
            return "product_recommendation"

        # 13. General Product Recommendations & Fashion Searches
        product_terms_regex = r'\b(recommend|recommendation|suggestions?|suggest|outfits?|style|styling|garments?|clothes|clothing|apparel|wear|wears|wearing|gala|party|wedding|formal|casual|winter|dresses?|gowns?|gwon|shirts?|t-shirts?|tees?|tops?|blazers?|coats?|overcoats?|trenches?|jackets?|trousers?|pants?|denim|jeans?|knits?|knitwear|sweaters?|cashmere|boots?|shoes?|bags?|handbags?|totes?|accessories|piece|pieces|buy|shop|catalog|catalogue|collection|look)\b'
        if re.search(product_terms_regex, msg) or re.search(r'\b\d+\s*(?:rs|inr|rupees)\b', msg) or re.search(r'₹\s*\d+', msg):
            return "product_recommendation"

        return "general_concierge"

    @classmethod
    def build_user_context(cls, user: User, message: str, past_messages: list = None, cart_count: Optional[int] = None, cart_items: Optional[list] = None) -> Tuple[str, Dict[str, Any], str]:
        """
        Builds the authorized context and prompt using verified database ground truth.
        Returns: (system_prompt, telemetry_metadata, detected_intent)
        """
        # 1. Enforce tenant isolation check
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

        # Base Persona and ultra-concise grounding directives
        system_prompt = (
            f"You are the official ZELORA Luxury AI Assistant for the ZELORA website.\n"
            f"Current Authenticated User: {first_name} ({user.email}).\n"
            f"User Role: {role_label}.\n"
            f"Currency Standard: Indian Rupees (₹).\n\n"
            f"STRICT WEBSITE-ONLY SCOPE POLICY:\n"
            f"- You ONLY answer questions related to the ZELORA website: products, fashion, styling, orders, cart, tracking, shipping, payments, addresses, profile, and platform analytics.\n"
            f"- If the user asks about ANY off-topic subject (coding, weather, sports, movies, cooking, math, trivia):\n"
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
            f"  • User: 'how much is black gwon?' -> Answer: '₹999.99 (In stock)'\n"
            f"  • User: 'is X in stock?' -> Answer: 'In stock' (or 'Out of stock')\n"
            f"  • User: 'how many products in store?' -> Answer: '21 products across 6 categories'\n"
            f"  • User: 'what is my email?' -> Answer: 'arsh@zelora.test'\n"
            f"  • User: 'recommend an evening gown' -> Answer: 'Here are our top evening gowns:'\n"
            f"  • User: 'platform revenue' -> Answer: '₹12,45,000 (34 orders)'\n"
            f"  • User: 'shop sales' -> Answer: '₹85,000 (12 items sold)'\n"
            f"  • User: 'hi / hello' -> Answer: 'Hi! How can I help?'\n\n"
            f"STRICT ZERO-HALLUCINATION & FACTUALITY POLICY (MANDATORY):\n"
            f"- Ground truth: You must strictly use ONLY the verified live database records provided below.\n"
            f"- NEVER make up, invent, or guess ANY product, price, order status, order ID, delivery date, customer name, email, or policy.\n"
            f"- If a product, order, or detail is NOT found in the verified records below, you MUST state plainly: 'No active orders' / 'Piece not in catalog' / 'Out of stock' / 'No records found'.\n"
            f"- NEVER fabricate fake luxury brands, item names, or numbers.\n\n"
        )

        retrieved_data = {}

        # 3. Retrieve verified role-specific database telemetry
        if intent == "customer_cart":
            computed_items = cart_items or []
            if cart_count is not None and cart_count > 0:
                count = cart_count
            elif computed_items:
                count = sum(int(it.get('quantity', 1)) for it in computed_items)
            else:
                count = cart_count if cart_count is not None else 0

            retrieved_data["cart_count"] = count
            retrieved_data["cart_items"] = computed_items

            if computed_items:
                breakdown_lines = [
                    f"- {it.get('name', 'Product')} (Qty: {it.get('quantity', 1)}, Size: {it.get('size', 'Standard')}, Color: {it.get('color', 'N/A')}, Price: ₹{it.get('price', 0)})"
                    for it in computed_items
                ]
                items_text = "\n".join(breakdown_lines)
            else:
                items_text = "No items recorded in shopping bag."

            system_prompt += (
                f"--- LIVE SHOPPING CART DATA (CLIENT TELEMETRY) ---\n"
                f"Total Items in Cart: {count}\n"
                f"Cart Contents Breakdown:\n{items_text}\n"
                f"----------------------------------------------------\n"
                f"DIRECTIVE FOR CART QUERIES (MANDATORY):\n"
                f"- If asked 'how many item in cart', 'how many items in cart', 'cart count', answer ONLY the exact number: '{count}' (or '{count} item' if 1, '{count} items' if > 1, or '0' if empty).\n"
                f"- If count is > 0, NEVER state that the cart contains no items!\n"
                f"- If asked what items are in the cart, output the concise item name(s) (e.g. '{computed_items[0].get('name')}' if 1 item).\n\n"
            )

        elif intent in ["customer_order_status", "customer_payment_status"]:
            order = RetrievalService.get_customer_order(user, message)
            retrieved_data["latest_order"] = order
            if order:
                system_prompt += (
                    f"--- VERIFIED LIVE ORDER RECORD (FROM DATABASE) ---\n"
                    f"Order ID: {order['order_id']}\n"
                    f"Order Date: {order['date']}\n"
                    f"Status: {order['status']}\n"
                    f"Payment Status: {order['payment_status']} (via {order['payment_method']})\n"
                    f"Total Amount: {order['total_amount']}\n"
                    f"Estimated Delivery: {order['estimated_delivery']}\n"
                    f"Tracking Number: {order['tracking_number']}\n"
                    f"Items: {', '.join(order['items'])}\n"
                    f"--------------------------------------------------\n"
                    f"DIRECTIVE: Answer ONLY the status (e.g. '{order['status'].title()}'). If they ask about payment, answer ONLY the payment status (e.g. 'Paid via {order['payment_method']}').\n\n"
                )
            else:
                system_prompt += (
                    f"--- VERIFIED LIVE ORDER RECORD (FROM DATABASE) ---\n"
                    f"User has not placed any orders yet on ZELORA.\n"
                    f"--------------------------------------------------\n"
                    f"DIRECTIVE: Answer ONLY: 'No active orders'.\n\n"
                )

        elif intent == "customer_order_history":
            orders = RetrievalService.get_customer_orders_summary(user, limit=5)
            stats = RetrievalService.get_customer_stats(user)
            retrieved_data["orders"] = orders
            retrieved_data["stats"] = stats
            system_prompt += (
                f"--- VERIFIED ORDER HISTORY (FROM DATABASE) ---\n"
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
            system_prompt += (
                f"----------------------------------------------\n"
                f"DIRECTIVE: Answer ONLY with the number of orders or a concise list (e.g. '{stats['total_orders']} orders').\n\n"
            )

        elif intent == "customer_address":
            addresses = RetrievalService.get_customer_addresses(user)
            retrieved_data["addresses"] = addresses
            system_prompt += f"--- VERIFIED SAVED ADDRESSES (FROM DATABASE) ---\n"
            if addresses:
                for a in addresses:
                    system_prompt += f"- {a['type']} ({'Default' if a['is_default'] else 'Alternative'}): {a['full_name']}, {a['line']}, {a['city']}, {a['state']} - {a['pin_code']}\n"
                default_addr = next((a for a in addresses if a.get("is_default")), addresses[0])
                system_prompt += (
                    f"-------------------------------------------------\n"
                    f"DIRECTIVE: Answer ONLY with the primary address (e.g. '{default_addr['line']}, {default_addr['city']}').\n\n"
                )
            else:
                system_prompt += (
                    f"No delivery addresses saved yet in profile.\n"
                    f"-------------------------------------------------\n"
                    f"DIRECTIVE: Answer ONLY: 'No saved addresses'.\n\n"
                )

        elif intent == "user_profile":
            profile = RetrievalService.get_user_profile(user)
            retrieved_data["profile"] = profile
            system_prompt += (
                f"--- VERIFIED USER ACCOUNT PROFILE (FROM DATABASE) ---\n"
                f"Full Name: {profile['name']}\n"
                f"Email: {profile['email']}\n"
                f"Phone: {profile['phone_number']}\n"
                f"Role: {profile['role']}\n"
                f"Email Verified: {'Yes' if profile['is_email_verified'] else 'No'}\n"
                f"Member Since: {profile['date_joined']}\n"
                f"----------------------------------------------------\n"
                f"DIRECTIVE: Answer ONLY the requested profile detail (e.g. '{profile['email']}' or '{profile['name']}').\n\n"
            )

        elif intent == "customer_notifications":
            notifs = RetrievalService.get_customer_notifications(user)
            retrieved_data["notifications"] = notifs
            system_prompt += (
                f"--- VERIFIED USER NOTIFICATIONS (FROM DATABASE) ---\n"
                f"Total Recent Notifications: {len(notifs)}\n"
            )
            if notifs:
                for n in notifs:
                    system_prompt += f"- [{n['category'].title()}] {n['title']}: {n['description']} ({n['date']})\n"
                system_prompt += (
                    f"----------------------------------------------------\n"
                    f"DIRECTIVE: Answer ONLY: '{len(notifs)} notifications: {notifs[0]['title']}'.\n\n"
                )
            else:
                system_prompt += (
                    f"No notifications currently recorded in account.\n"
                    f"----------------------------------------------------\n"
                    f"DIRECTIVE: Answer ONLY: 'No new notifications'.\n\n"
                )

        elif intent == "catalog_overview":
            overview = RetrievalService.get_catalog_overview()
            retrieved_data["catalog_meta"] = overview
            system_prompt += (
                f"--- VERIFIED LIVE CATALOG METRICS (FROM DATABASE) ---\n"
                f"Total Products in Database: {overview['total_products']}\n"
                f"In-Stock Products: {overview['in_stock_products']}\n"
                f"Available Categories: {', '.join(overview['categories'])}\n"
                f"Featured Brands: {', '.join(overview['brands'])}\n"
                f"Catalog Price Range: ₹{overview['min_price']:,.2f} - ₹{overview['max_price']:,.2f}\n"
                f"Lowest Priced Piece: {overview['cheapest_product']} (₹{overview['min_price']:,.2f})\n"
                f"Highest Priced Piece: {overview['most_expensive_product']} (₹{overview['max_price']:,.2f})\n"
                f"------------------------------------------------------\n"
                f"DIRECTIVE: Answer strictly based on these figures (e.g. '{overview['total_products']} products across {len(overview['categories'])} categories' or '{', '.join(overview['categories'])}').\n\n"
            )

        elif intent == "seller_products":
            if not user.is_seller:
                system_prompt += "Notice: User is not a registered Seller.\nDIRECTIVE: Inform user that vendor access is required.\n\n"
            else:
                sp = RetrievalService.get_seller_products(user)
                retrieved_data["seller_products"] = sp
                system_prompt += (
                    f"--- VERIFIED BOUTIQUE INVENTORY (FROM DATABASE) ---\n"
                    f"Boutique Name: {sp['shop_name']}\n"
                    f"Total Boutique Products: {sp['total_products']} ({sp['in_stock_products']} in stock)\n"
                )
                if sp["products"]:
                    for idx, p in enumerate(sp["products"], 1):
                        system_prompt += f"{idx}. {p['name']} | ₹{p['price']:,.2f} | Stock: {p['stock_quantity']} | {'In Stock' if p['in_stock'] else 'Out of Stock'}\n"
                else:
                    system_prompt += "No products added to this boutique yet.\n"
                system_prompt += (
                    f"---------------------------------------------------\n"
                    f"DIRECTIVE: Answer ONLY with the product count or product list (e.g. '{sp['total_products']} products in boutique').\n\n"
                )

        elif intent == "seller_analytics":
            if not user.is_seller:
                system_prompt += "Notice: User is registered as Customer, not Seller.\nDIRECTIVE: Inform user that seller account is required.\n\n"
            else:
                shop_info = RetrievalService.get_seller_shop_details(user)
                sales_info = RetrievalService.get_seller_orders_and_sales(user)
                retrieved_data["shop"] = shop_info
                retrieved_data["sales"] = sales_info
                system_prompt += (
                    f"--- VERIFIED VENDOR ATELIER DATA (FROM DATABASE) ---\n"
                    f"Boutique Name: {shop_info['name'] if shop_info else user.shop_name}\n"
                    f"Storefront Status: {'Active & Open' if (shop_info and shop_info['is_open']) else 'Paused'}\n"
                    f"Total Units Sold: {sales_info['total_units_sold'] if sales_info else 0}\n"
                    f"Sales Volume: {sales_info['estimated_sales_volume'] if sales_info else '₹0.00'}\n"
                    f"----------------------------------------------------\n"
                    f"DIRECTIVE: Answer ONLY with sales volume or units sold (e.g. '{sales_info['estimated_sales_volume'] if sales_info else '₹0.00'} ({sales_info['total_units_sold'] if sales_info else 0} units sold)').\n\n"
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
                f"Total Catalog Products: {metrics['total_products_in_catalog']} ({metrics['in_stock_products']} in stock)\n"
                f"Active Platform Coupons: {metrics['active_coupons']}\n"
                f"-----------------------------------------------------------\n"
                f"DIRECTIVE: Answer ONLY with the factual metric requested (e.g. '{metrics['platform_gross_merchandise_volume']} ({metrics['total_orders_placed']} orders)').\n\n"
            )

        elif intent == "product_recommendation":
            search_query = message
            if past_messages:
                recent_user_msgs = [m['content'] for m in past_messages if m.get('role') == 'user']
                if recent_user_msgs and len(message.split()) <= 4:
                    search_query = f"{recent_user_msgs[-1]} {message}"

            products, parsed_query = RetrievalService.get_product_recommendations(search_query)
            retrieved_data["products"] = products
            retrieved_data["query_meta"] = parsed_query

            if products:
                prod_summary = "\n".join([
                    f"{i+1}. ID: {p['id']} | Name: {p['name']} | Price: ₹{p['price']:,.2f} | Category: {p['category']} | Gender: {p['gender']} | Status: {'In Stock' if p['in_stock'] else 'Out of Stock'} (Qty: {p['stock_quantity']})\n   Description: {p['description']}"
                    for i, p in enumerate(products)
                ])

                if parsed_query.get("specific_inquiry"):
                    first_p = products[0]
                    system_prompt += (
                        f"--- VERIFIED LIVE DATABASE PRODUCT (EXACT MATCH) ---\n"
                        f"Product Found in Database:\n{prod_summary}\n"
                        f"----------------------------------------------------\n"
                        f"DIRECTIVE FOR SPECIFIC PRODUCT:\n"
                        f"- If the user asks about the price: Answer ONLY the price and status (e.g. '₹{first_p['price']:,.2f} ({'In stock' if first_p['in_stock'] else 'Out of stock'})').\n"
                        f"- If the user asks if it is in stock or available: Answer ONLY the stock status (e.g. '{'In stock' if first_p['in_stock'] else 'Out of stock'} (₹{first_p['price']:,.2f})').\n"
                        f"- If they ask for general details: Give strictly 1 brief sentence with exact price and status.\n\n"
                    )
                else:
                    system_prompt += (
                        f"--- VERIFIED LIVE DATABASE PRODUCTS (GROUND TRUTH) ---\n"
                        f"Found {len(products)} matching piece(s) in catalog:\n"
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
