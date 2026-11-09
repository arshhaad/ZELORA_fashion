from rest_framework import serializers
from .models import Conversation, ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = [
            'id',
            'role',
            'content',
            'provider',
            'model_used',
            'intent_detected',
            'created_at',
        ]
        read_only_fields = fields


class ConversationSerializer(serializers.ModelSerializer):
    messages_count = serializers.IntegerField(source='messages.count', read_only=True)
    latest_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id',
            'title',
            'messages_count',
            'latest_message',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields

    def get_latest_message(self, obj):
        msg = obj.messages.order_by('-created_at').first()
        return msg.content[:80] if msg else None


class ConversationDetailSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = [
            'id',
            'title',
            'messages',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields


class AIChatRequestSerializer(serializers.Serializer):
    message = serializers.CharField(
        max_length=2000,
        min_length=1,
        trim_whitespace=True,
        required=True
    )
    conversation_id = serializers.UUIDField(required=False, allow_null=True)
    preferred_provider = serializers.ChoiceField(
        choices=['gemini', 'groq'],
        required=False,
        allow_null=True
    )

