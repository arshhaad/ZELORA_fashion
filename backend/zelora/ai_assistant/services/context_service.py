import re
from typing import Dict, Any, Tuple
from CUSTOMER.models import User
from .retrieval_service import RetrievalService, SecurityViolationError


class ContextService:
    """
    Identifies query intent and builds authorized, role-bounded system prompts
    and context bundles for the LLM.
    """

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

        # Product Recommendations & Style Advice
        if any(term in msg for term in [
            "recommend", "what should i wear", "suggestion", "style", "outfit",
            "wool overcoat", "gown", "dress", "trench", "cashmere", "shoes", "jacket"
        ]):
            return "product_recommendation"

        return "general_concierge"

    @classmethod
    def build_user_context(cls, user: User, message: str) -> Tuple[str, Dict[str, Any], str]:
        """
        Builds the authorized context and prompt.
        Returns: (system_prompt, telemetry_metadata, detected_intent)
        """
        # 1. First enforce tenant isolation check
        if RetrievalService.detect_unauthorized_cross_tenant_intent(message, user):
            raise SecurityViolationError(
                "Access Denied: You are not authorized to view or request records belonging to other accounts."
            )

        intent = cls.identify_intent(message)
        first_name = user.first_name or user.email.split('@')[0].capitalize()
        role_label = "Administrator" if (user.is_staff or user.is_superuser) else ("Boutique Seller" if user.is_seller else "Customer")

        # Base Persona
        system_prompt = (
            f"You are the official ZELORA Luxury AI Assistant — an intelligent, elegant, and secure assistant "
            f"for the ZELORA monochrome editorial luxury fashion house.\n"
            f"Current Authenticated User: {first_name} ({user.email}).\n"
            f"User Role: {role_label}.\n"
            f"Currency Standard: Indian Rupees (₹). Format all monetary figures with '₹' symbol.\n"
            f"Brand Tone: Gracious, refined, direct, and helpful. Always greet the user warmly as '{first_name}'.\n"
            f"Core Security Directives:\n"
            f"- Strictly use only the verified account records provided below as ground truth.\n"
            f"- Never fabricate order numbers, tracking links, or statuses.\n"
            f"- Never reveal or hypothesize about other users' orders or details.\n"
            f"- If no records exist, inform the user graciously.\n\n"
        )

        retrieved_data = {}

        # 2. Fetch role-specific authorized data based on intent
        if intent in ["customer_order_status", "customer_payment_status"]:
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
                    f"-----------------------------------\n\n"
                )
            else:
                system_prompt += (
                    f"--- VERIFIED LIVE ORDER RECORD ---\n"
                    f"User has not placed any orders yet on ZELORA.\n"
                    f"-----------------------------------\n\n"
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
            system_prompt += (
                f"--- PRODUCT CATALOG RECOMMENDATION GUIDE ---\n"
                f"Highlight pieces from the ZELORA Autumn/Winter and Monochrome Haute Couture Collections:\n"
                f"1. Structured Double-Breasted Wool Overcoat (₹349 / Regular ₹420)\n"
                f"2. Draped Silk Evening Slip Gown (₹260 / Regular ₹320)\n"
                f"3. High-Waist Pleated Wool Flannel Trousers (₹185)\n"
                f"4. Architectural Double-Breasted Wool Trench (₹420)\n"
                f"5. Cashmere Mock-Neck Cocoon Knit (₹240)\n"
                f"6. Square-Toe Italian Calfskin Ankle Boots (₹310)\n"
                f"Emphasize pure Mulberry silk, bonded Melton wool, sculptural silhouettes, and monochrome palette (Noir Black, Ecru, Camel, Charcoal).\n"
                f"-------------------------------------------\n\n"
            )

        return system_prompt, retrieved_data, intent
