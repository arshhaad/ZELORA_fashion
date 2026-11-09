import os
import requests
import logging

logger = logging.getLogger(__name__)


class GeminiAPIError(Exception):
    pass


class GeminiService:
    """
    Google Gemini API Integration for ZELORA AI Assistant.
    Primary provider for luxury conversation, styling recommendations, and natural language understanding.
    """

    def __init__(self):
        self.api_key = (
            os.getenv('GOOGLE_API_KEY') or
            os.getenv('GEMINI_API_KEY') or
            ''
        ).strip()
        self.model = os.getenv('GEMINI_MODEL', 'gemini-3.5-flash-lite').strip()
        self.timeout = int(os.getenv('GEMINI_TIMEOUT_SECONDS', '18'))

    def is_configured(self) -> bool:
        return bool(self.api_key)

    def generate_chat_response(self, system_prompt: str, user_message: str, history: list = None) -> dict:
        """
        Executes a chat completion call with system instructions and prior conversation history.
        """
        if not self.is_configured():
            raise GeminiAPIError("Google Gemini API key is not configured in backend environment.")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"

        contents = []

        # Include prior messages from conversation history if provided
        if history:
            for msg in history[-6:]:  # Keep recent context window concise and relevant
                role = "user" if msg.get("role") == "user" else "model"
                contents.append({
                    "role": role,
                    "parts": [{"text": msg.get("content", "")}]
                })

        # Append current user prompt
        contents.append({
            "role": "user",
            "parts": [{"text": user_message}]
        })

        payload = {
            "system_instruction": {
                "parts": [{"text": system_prompt}]
            },
            "contents": contents,
            "generationConfig": {
                "temperature": 0.5,
                "maxOutputTokens": 600,
                "topP": 0.95,
            }
        }

        try:
            response = requests.post(
                url,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=self.timeout
            )

            if response.status_code == 200:
                data = response.json()
                candidates = data.get("candidates", [])
                if not candidates:
                    raise GeminiAPIError("No response candidate returned by Gemini API.")

                parts = candidates[0].get("content", {}).get("parts", [])
                text_parts = [p.get("text", "") for p in parts if "text" in p]
                reply_text = "\n".join(text_parts).strip()

                return {
                    "text": reply_text,
                    "provider": "gemini",
                    "model": self.model,
                    "raw_tokens": data.get("usageMetadata", {}).get("totalTokenCount", 0),
                }

            elif response.status_code == 429:
                raise GeminiAPIError("Gemini API rate limit exceeded (HTTP 429).")
            else:
                error_detail = response.text
                try:
                    error_json = response.json()
                    error_detail = error_json.get("error", {}).get("message", response.text)
                except Exception:
                    pass
                raise GeminiAPIError(f"Gemini API Error [{response.status_code}]: {error_detail}")

        except requests.Timeout:
            raise GeminiAPIError("Gemini API call timed out.")
        except requests.RequestException as e:
            raise GeminiAPIError(f"Network error communicating with Gemini API: {str(e)}")
