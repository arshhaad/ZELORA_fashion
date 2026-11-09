from django.urls import path
from .views import (
    AIChatView,
    ConversationListView,
    ConversationDetailView,
    AIClearAllConversationsView,
)

urlpatterns = [
    path('chat/', AIChatView.as_view(), name='ai-chat'),
    path('conversations/', ConversationListView.as_view(), name='ai-conversations'),
    path('conversations/<uuid:pk>/', ConversationDetailView.as_view(), name='ai-conversation-detail'),
    path('conversations/clear-all/', AIClearAllConversationsView.as_view(), name='ai-clear-all'),
]
