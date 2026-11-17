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
    def generate_grounded_fallback(user, intent: str, retrieved_data: dict) -> tuple:
        """
        Generates a direct, factual, role-grounded response from live database telemetry
        when external LLM APIs are unreachable, rate-limited, or misconfigured.
        """
        first_name = user.first_name or user.email.split('@')[0].capitalize()

        if intent in ["customer_order_status", "customer_payment_status"]:
            latest = retrieved_data.get("latest_order")
            if latest:
                reply = (
                    f"Hello {first_name}, your latest order #{latest['order_id']} is currently "
                    f"{latest['status'].upper()}. Total: {latest['total_amount']} ({latest['payment_status']} via {latest['payment_method']}). "
                    f"Estimated delivery: {latest['estimated_delivery']}."
                )
            else:
                reply = f"Hello {first_name}, you have not placed any orders yet on ZELORA. Feel free to explore our latest collection!"
            return reply, "zelora_concierge", "data-grounded"

        elif intent == "customer_order_history":
            stats = retrieved_data.get("stats", {})
            orders = retrieved_data.get("orders", [])
            total_orders = stats.get("total_orders", len(orders))
            total_spent = stats.get("total_spent", "₹0")
            if total_orders > 0:
                reply = (
                    f"Hello {first_name}, you have placed {total_orders} order(s) with ZELORA "
                    f"amounting to {total_spent}."
                )
            else:
                reply = f"Hello {first_name}, you currently have no prior orders recorded in your account."
            return reply, "zelora_concierge", "data-grounded"

        elif intent == "customer_address":
            addresses = retrieved_data.get("addresses", [])
            if addresses:
                default_addr = next((a for a in addresses if a.get("is_default")), addresses[0])
                reply = (
                    f"Hello {first_name}, your primary delivery address on file is: "
                    f"{default_addr.get('house_building', '')}, {default_addr.get('street_area', '')}, "
                    f"{default_addr.get('city', '')} - {default_addr.get('pin_code', '')}."
                )
            else:
                reply = f"Hello {first_name}, you currently have no saved addresses. You can add one in your account settings."
            return reply, "zelora_concierge", "data-grounded"

        elif intent == "admin_analytics":
            stats = retrieved_data.get("stats", {})
            reply = (
                f"Platform Analytics: Total revenue is {stats.get('total_revenue', '₹0')} across "
                f"{stats.get('total_orders', 0)} orders with {stats.get('total_customers', 0)} registered patrons."
            )
            return reply, "zelora_admin_guard", "analytics-engine"

        elif intent == "seller_analytics":
            stats = retrieved_data.get("stats", {})
            reply = (
                f"Atelier Analytics: Total revenue generated is {stats.get('total_revenue', '₹0')} "
                f"from {stats.get('total_orders', 0)} orders across {stats.get('total_products', 0)} listed garments."
            )
            return reply, "zelora_seller_guard", "atelier-engine"

        elif intent == "product_recommendation":
            products = retrieved_data.get("products", [])
            if products:
                names = [p.get("name") for p in products[:3] if p.get("name")]
                reply = f"Here are curated pieces from our bespoke collection: {', '.join(names)}. Explore the pieces below!"
            else:
                reply = "Explore our latest monochrome couture and haute horlogerie collections in the store."
            return reply, "zelora_stylist", "catalog-engine"

        reply = f"Hello {first_name}! How may I assist your ZELORA wardrobe, order tracking, or boutique today?"
        return reply, "zelora_concierge", "direct-grounded"

    def post(self, request):
        serializer = AIChatRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        user_message = serializer.validated_data['message']
        conv_id = serializer.validated_data.get('conversation_id')
        preferred_provider = serializer.validated_data.get('preferred_provider')

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
                past_messages=past_messages
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
                    user, detected_intent, retrieved_data
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
                user, detected_intent, retrieved_data
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

