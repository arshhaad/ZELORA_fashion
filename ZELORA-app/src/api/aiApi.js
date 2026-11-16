// ZELORA Mobile Luxury AI Concierge API
import { apiClient } from './client';

export const aiApi = {
  sendMessage: async ({ message, conversation_id = null, preferred_provider = 'gemini' }) => {
    return await apiClient('/ai/chat/', {
      method: 'POST',
      body: JSON.stringify({
        message,
        conversation_id,
        preferred_provider,
      }),
    });
  },

  getConversationHistory: async (conversationId) => {
    return await apiClient(`/ai/conversations/${conversationId}/`);
  },
};
