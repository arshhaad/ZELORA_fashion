import os
import requests
import logging

logger = logging.getLogger(__name__)


class GroqAPIError(Exception):
    pass


class GroqService:
    """
    Groq High-Speed LLM Integration for ZELORA AI Assistant.
    Ideal for rapid transactional queries and automated fallback.
    """

    def __init__(self):
        self.api_key = (
            os.getenv('GROQ_API_KEY') or
            os.getenv('GORQ_API_KEY') or
            ''
        ).strip()
        self.model = os.getenv('GROQ_MODEL', 'qwen/qwen3.8-27b').strip()
        self.timeout = int(os.getenv('GROQ_TIMEOUT_SECONDS', '15'))

    def is_configured(self) -> bool:
        return bool(self.api_key)

    def generate_chat_response(self, system_prompt: str, user_message: str, history: list = None) -> dict:
        """
        Executes a high-speed chat completion using Groq's OpenAI-compatible API.
        """
        if not self.is_configured():
            raise GroqAPIError("Groq API key is not configured in backend environment.")

        url = "https://api.groq.com/openai/v1/chat/completions"

        messages = [
            {"role": "system", "content": system_prompt}
        ]

        # Append recent conversation history
        if history:
            for msg in history[-6:]:
                role = "assistant" if msg.get("role") in ["assistant", "model"] else "user"
                messages.append({
                    "role": role,
                    "content": msg.get("content", "")
                })

        messages.append({
            "role": "user",
            "content": user_message
        })

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.4,
            "max_tokens": 500,
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        try:
            response = requests.post(url, json=payload, headers=headers, timeout=self.timeout)

            if response.status_code == 200:
                data = response.json()
                choices = data.get("choices", [])
                if not choices:
                    raise GroqAPIError("No response choices returned by Groq.")

                reply_text = choices[0].get("message", {}).get("content", "").strip()
                return {
                    "text": reply_text,
                    "provider": "groq",
                    "model": self.model,
                    "raw_tokens": data.get("usage", {}).get("total_tokens", 0)
                }

            elif response.status_code == 429:
                raise GroqAPIError("Groq rate limit exceeded (HTTP 429).")
            else:
                detail = response.text
                try:
                    detail = response.json().get("error", {}).get("message", response.text)
                except Exception:
                    pass
                raise GroqAPIError(f"Groq API Error [{response.status_code}]: {detail}")

        except requests.Timeout:
            raise GroqAPIError("Groq API call timed out.")
        except requests.RequestException as e:
            raise GroqAPIError(f"Network error communicating with Groq API: {str(e)}")
