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
from .services.context_service import ContextService
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
        try:
            system_prompt, retrieved_data, detected_intent = ContextService.build_user_context(
                user=user,
                message=user_message,
                past_messages=past_messages
            )

            # 4. Generate AI Response via Primary/Fallback Provider
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
            logger.error(f"Error during AI response generation: {e}", exc_info=True)
            return Response(
                {"detail": "The ZELORA Concierge service is momentarily occupied. Please re-send your message."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

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

