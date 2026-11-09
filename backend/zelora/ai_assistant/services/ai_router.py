import os
import logging
from .gemini_service import GeminiService, GeminiAPIError
from .groq_service import GroqService, GroqAPIError

logger = logging.getLogger(__name__)


class AIRouter:
    """
    Central AI Dispatcher & Failover Controller for ZELORA.
    Supports primary provider dispatch with automatic fallback.
    """

    def __init__(self):
        self.gemini = GeminiService()
        self.groq = GroqService()
        self.default_provider = os.getenv('DEFAULT_AI_PROVIDER', 'gemini').lower().strip()

    def generate_response(self, system_prompt: str, user_message: str, history: list = None, preferred_provider: str = None) -> dict:
        """
        Attempts execution on the primary provider, failing over to secondary if an error occurs.
        """
        primary = (preferred_provider or self.default_provider).lower()
        secondary = "groq" if primary == "gemini" else "gemini"

        # 1. Try Primary
        try:
            if primary == "gemini" and self.gemini.is_configured():
                return self.gemini.generate_chat_response(system_prompt, user_message, history)
            elif primary == "groq" and self.groq.is_configured():
                return self.groq.generate_chat_response(system_prompt, user_message, history)
        except Exception as primary_err:
            logger.warning(f"Primary AI Provider [{primary}] failed: {primary_err}. Attempting fallback to [{secondary}].")

        # 2. Try Secondary (Fallback)
        try:
            if secondary == "groq" and self.groq.is_configured():
                res = self.groq.generate_chat_response(system_prompt, user_message, history)
                res["fallback_used"] = True
                return res
            elif secondary == "gemini" and self.gemini.is_configured():
                res = self.gemini.generate_chat_response(system_prompt, user_message, history)
                res["fallback_used"] = True
                return res
        except Exception as secondary_err:
            logger.error(f"Secondary AI Provider [{secondary}] also failed: {secondary_err}.")

        # 3. If neither provider succeeded
        raise RuntimeError(
            "Our AI Concierge service is temporarily unavailable due to high demand. Please try again shortly."
        )

