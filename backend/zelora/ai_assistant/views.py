import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Conversation, ChatMessage
from .serializers import (
    ChatMessageSerializer,
    ConversationSerializer,
    ConversationDetailSerializer,
    AIChatRequestSerializer,
)
from .permissions import IsAuthenticatedZeloraUser
from .services.context_service import ContextService, OffTopicQueryError
from .services.retrieval_service import SecurityViolationError
from .services.ai_router import AIRouter

logger = logging.getLogger(__name__)


class AIChatView(APIView):
    """
    Authenticated ZELORA Luxury AI Concierge Endpoint.
    - Validates JWT authentication token.
    - Resolves request.user and identity from backend session context.
    - Retrieves ONLY role-bounded database records.
    - Dispatches to Google Gemini with automatic Groq failover.
    - Persists thread messages in user-isolated conversation memory.
    """
    permission_classes = [IsAuthenticatedZeloraUser]

    @staticmethod
    def generate_grounded_fallback(user, intent: str, retrieved_data: dict, user_message: str = "") -> tuple:
        """
        Generates a direct, factual, role-grounded response from live database telemetry
        when external LLM APIs are unreachable, rate-limited, or misconfigured.
        """
        lower_msg = user_message.lower() if user_message else ""

        if intent == "customer_cart":
            count = retrieved_data.get("cart_count", 0)
            items = retrieved_data.get("cart_items", [])
            if any(w in lower_msg for w in ["what", "list", "which", "show"]):
                if items:
                    names = [f"{it.get('name', 'Item')} (x{it.get('quantity', 1)})" for it in items]
                    return ", ".join(names), "zelora_concierge", "data-grounded"
                return "Cart is empty" if count == 0 else f"{count} items", "zelora_concierge", "data-grounded"
            return f"{count}", "zelora_concierge", "data-grounded"

        elif intent == "customer_order_status":
            latest = retrieved_data.get("latest_order")
            if latest:
                reply = f"{latest['status'].title()}"
            else:
                reply = "No active orders"
            return reply, "zelora_concierge", "data-grounded"

        elif intent == "customer_payment_status":
            latest = retrieved_data.get("latest_order")
            if latest:
                reply = f"{latest['payment_status'].title()} (via {latest['payment_method']})"
            else:
                reply = "No active orders"
            return reply, "zelora_concierge", "data-grounded"

        elif intent == "customer_order_history":
            stats = retrieved_data.get("stats", {})
            orders = retrieved_data.get("orders", [])
            total_orders = stats.get("total_orders", len(orders))
            if total_orders > 0:
                reply = f"{total_orders} orders"
            else:
                reply = "0 orders"
            return reply, "zelora_concierge", "data-grounded"

        elif intent == "customer_address":
            addresses = retrieved_data.get("addresses", [])
            if addresses:
                default_addr = next((a for a in addresses if a.get("is_default")), addresses[0])
                reply = f"{default_addr.get('line', '')}, {default_addr.get('city', '')}"
            else:
                reply = "No saved addresses"
            return reply, "zelora_concierge", "data-grounded"

        elif intent == "user_profile":
            profile = retrieved_data.get("profile", {})
            if "email" in lower_msg:
                reply = profile.get("email") or user.email
            elif "phone" in lower_msg:
                reply = profile.get("phone_number") or "Not registered"
            elif "name" in lower_msg:
                reply = profile.get("name") or user.first_name or user.email
            else:
                reply = f"{profile.get('name', '')} ({profile.get('email', user.email)})"
            return reply, "zelora_concierge", "data-grounded"

        elif intent == "customer_notifications":
            notifs = retrieved_data.get("notifications", [])
            if notifs:
                reply = f"{len(notifs)} notification{'s' if len(notifs) != 1 else ''}: {notifs[0]['title']}"
            else:
                reply = "No new notifications"
            return reply, "zelora_concierge", "data-grounded"

        elif intent == "catalog_overview":
            meta = retrieved_data.get("catalog_meta", {})
            total = meta.get("total_products", 0)
            cats = meta.get("categories", [])
            if "category" in lower_msg or "categories" in lower_msg:
                reply = ", ".join(cats) if cats else "Outerwear, Dresses, Tops, Trousers, Knitwear"
            elif "brand" in lower_msg or "brands" in lower_msg:
                reply = ", ".join(meta.get("brands", [])) or "ZELORA Atelier"
            elif "cheap" in lower_msg:
                reply = f"{meta.get('cheapest_product', 'Luxury piece')} (₹{meta.get('min_price', 0):,.2f})"
            elif "expensive" in lower_msg:
                reply = f"{meta.get('most_expensive_product', 'Haute piece')} (₹{meta.get('max_price', 0):,.2f})"
            else:
                reply = f"{total} products across {len(cats)} categories"
            return reply, "zelora_concierge", "data-grounded"

        elif intent == "seller_products":
            sp = retrieved_data.get("seller_products", {})
            total = sp.get("total_products", 0)
            reply = f"{total} products in boutique"
            return reply, "zelora_seller_guard", "atelier-engine"

        elif intent == "admin_analytics":
            metrics = retrieved_data.get("admin_metrics", {})
            gmv = metrics.get("platform_gross_merchandise_volume", "₹0.00")
            orders = metrics.get("total_orders_placed", 0)
            reply = f"{gmv} ({orders} orders)"
            return reply, "zelora_admin_guard", "analytics-engine"

        elif intent == "seller_analytics":
            sales = retrieved_data.get("sales", {})
            vol = sales.get("estimated_sales_volume", "₹0.00")
            units = sales.get("total_units_sold", 0)
            reply = f"{vol} ({units} units sold)"
            return reply, "zelora_seller_guard", "atelier-engine"

        elif intent == "product_recommendation":
            prods = retrieved_data.get("products", [])
            query_meta = retrieved_data.get("query_meta", {})
            occasion = query_meta.get("occasion")
            if occasion and prods:
                first_name = prods[0].get("name", "our signature couture piece")
                reply = f"For your {occasion}, we recommend the {first_name}."
                return reply, "zelora_stylist", "redis-cache"
            elif query_meta.get("specific_inquiry") and prods:
                p = prods[0]
                status_str = "In stock" if p.get("in_stock") else "Out of stock"
                price_str = f"₹{p['price']:,.2f}"
                if "how much" in lower_msg or "price" in lower_msg or "cost" in lower_msg:
                    reply = f"{price_str} ({status_str})"
                elif "stock" in lower_msg or "available" in lower_msg:
                    reply = f"{status_str} ({price_str})"
                else:
                    reply = f"{p['name']} - {price_str} ({status_str})"
                return reply, "zelora_stylist", "catalog-engine"
            elif prods:
                reply = "Here are our top pieces for you:"
                return reply, "zelora_stylist", "catalog-engine"
            else:
                reply = "No matching pieces found in the catalog."
                return reply, "zelora_stylist", "catalog-engine"

        reply = "Hi! How can I help?"
        return reply, "zelora_concierge", "direct-grounded"

    def post(self, request):
        serializer = AIChatRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        user_message = serializer.validated_data['message']
        conv_id = serializer.validated_data.get('conversation_id')
        preferred_provider = serializer.validated_data.get('preferred_provider')
        cart_count = serializer.validated_data.get('cart_count')
        cart_items = serializer.validated_data.get('cart_items') or []

        # 1. Resolve or Initialize Conversation Thread
        conversation = None
        if conv_id:
            try:
                # Security Check: Ensure conversation belongs strictly to request.user
                conversation = Conversation.objects.get(id=conv_id, user=user)
            except Conversation.DoesNotExist:
                return Response(
                    {"detail": "Conversation thread not found or unauthorized."},
                    status=status.HTTP_404_NOT_FOUND
                )

        if not conversation:
            # Generate a title from the first 5 words of user prompt
            words = user_message.split()
            title = " ".join(words[:5]) if words else "New Consultation"
            conversation = Conversation.objects.create(
                user=user,
                title=title
            )

        # 2. Extract Recent Context History for Thread Memory
        past_messages = list(
            conversation.messages.order_by('created_at')[:10].values('role', 'content')
        )

        # 3. Context & Authorization Construction
        ai_router = AIRouter()
        retrieved_data = {}
        detected_intent = "general_concierge"
        try:
            system_prompt, retrieved_data, detected_intent = ContextService.build_user_context(
                user=user,
                message=user_message,
                past_messages=past_messages,
                cart_count=cart_count,
                cart_items=cart_items,
            )

            # 4. Generate AI Response via Primary/Fallback Provider
            try:
                ai_result = ai_router.generate_response(
                    system_prompt=system_prompt,
                    user_message=user_message,
                    history=past_messages,
                    preferred_provider=preferred_provider
                )

                reply_text = ai_result['text']
                provider_used = ai_result['provider']
                model_used = ai_result['model']
                fallback_used = ai_result.get('fallback_used', False)
            except Exception as llm_err:
                logger.warning(f"External LLM invocation failed ({llm_err}). Generating grounded fallback.")
                reply_text, provider_used, model_used = self.generate_grounded_fallback(
                    user, detected_intent, retrieved_data, user_message
                )
                fallback_used = True

        except OffTopicQueryError as off_err:
            logger.info(f"Off-topic query blocked for user {user.id} ({user.email}): {off_err.topic}")
            reply_text = (
                f"Sorry, we can't provide information about {off_err.topic}. "
                f"Please ask questions related to ZELORA."
            )
            provider_used = "zelora_guard"
            model_used = "scope-policy"
            detected_intent = "off_topic"
            fallback_used = False

        except SecurityViolationError as sec_err:
            logger.warning(f"Security boundary check triggered for user {user.id} ({user.email}): {sec_err}")
            reply_text = (
                f"Security Policy: You are only authorized to view records associated with your personal "
                f"ZELORA account. Access to another user's private data or database internals is restricted."
            )
            provider_used = "security_guard"
            model_used = "policy-engine"
            detected_intent = "security_violation"
            fallback_used = False

        except Exception as e:
            logger.error(f"Error during context/response generation: {e}", exc_info=True)
            reply_text, provider_used, model_used = self.generate_grounded_fallback(
                user, detected_intent, retrieved_data, user_message
            )
            fallback_used = True

        # 5. Persist Chat Messages in Thread Memory
        ChatMessage.objects.create(
            conversation=conversation,
            role='user',
            content=user_message
        )
        assistant_msg = ChatMessage.objects.create(
            conversation=conversation,
            role='assistant',
            content=reply_text,
            provider=provider_used,
            model_used=model_used,
            intent_detected=detected_intent
        )

        conversation.save(update_fields=['updated_at'])

        return Response({
            "conversation_id": str(conversation.id),
            "message_id": assistant_msg.id,
            "reply": reply_text,
            "provider": provider_used,
            "model": model_used,
            "intent": detected_intent,
            "fallback_used": fallback_used,
            "created_at": assistant_msg.created_at,
            "products": retrieved_data.get("products", []),
        }, status=status.HTTP_200_OK)


class ConversationListView(APIView):
    """
    Lists all past AI conversations for the currently logged-in user.
    """
    permission_classes = [IsAuthenticatedZeloraUser]

    def get(self, request):
        conversations = Conversation.objects.filter(user=request.user).order_by('-updated_at')[:20]
        serializer = ConversationSerializer(conversations, many=True)
        return Response(serializer.data)

    def post(self, request):
        conversation = Conversation.objects.create(
            user=request.user,
            title="New Luxury Consultation"
        )
        return Response(ConversationSerializer(conversation).data, status=status.HTTP_201_CREATED)


class ConversationDetailView(APIView):
    """
    Retrieves or deletes a specific conversation thread for request.user.
    """
    permission_classes = [IsAuthenticatedZeloraUser]

    def get(self, request, pk):
        try:
            conv = Conversation.objects.get(id=pk, user=request.user)
            return Response(ConversationDetailSerializer(conv).data)
        except Conversation.DoesNotExist:
            return Response({"detail": "Conversation not found."}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            conv = Conversation.objects.get(id=pk, user=request.user)
            conv.delete()
            return Response({"message": "Conversation history deleted successfully."}, status=status.HTTP_200_OK)
        except Conversation.DoesNotExist:
            return Response({"detail": "Conversation not found."}, status=status.HTTP_404_NOT_FOUND)


class AIClearAllConversationsView(APIView):
    """
    Clears all AI conversation history for the authenticated user.
    """
    permission_classes = [IsAuthenticatedZeloraUser]

    def post(self, request):
        deleted_count, _ = Conversation.objects.filter(user=request.user).delete()
        return Response({
            "message": f"Successfully cleared {deleted_count} conversation record(s)."
        })

