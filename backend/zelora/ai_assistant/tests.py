from unittest.mock import patch
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from CUSTOMER.models import User, Order, OrderItem, Address, SellerShop
from ai_assistant.models import Conversation, ChatMessage
from ai_assistant.services.retrieval_service import RetrievalService, SecurityViolationError
from ai_assistant.services.context_service import ContextService
from ai_assistant.services.ai_router import AIRouter


class AIAssistantSecurityTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # 1. Customer User A (Arsh)
        self.user_arsh = User.objects.create_user(
            email="arsh@zelora.test",
            password="SecurePassword123!",
            first_name="Arsh",
            last_name="Choudhary",
            is_email_verified=True
        )
        self.token_arsh = str(RefreshToken.for_user(self.user_arsh).access_token)

        # 2. Customer User B (Bob)
        self.user_bob = User.objects.create_user(
            email="bob@zelora.test",
            password="SecurePassword123!",
            first_name="Bob",
            last_name="Sterling",
            is_email_verified=True
        )
        self.token_bob = str(RefreshToken.for_user(self.user_bob).access_token)

        # 3. Seller User A (Eleanor)
        self.seller_a = User.objects.create_user(
            email="seller_a@zelora.test",
            password="SecurePassword123!",
            first_name="Eleanor",
            last_name="Vance",
            is_seller=True,
            shop_name="Maison de L'Ombre",
            is_email_verified=True
        )
        self.shop_a = SellerShop.objects.create(
            owner=self.seller_a,
            name="Maison de L'Ombre",
            category="Haute Couture"
        )
        self.token_seller_a = str(RefreshToken.for_user(self.seller_a).access_token)

        # 4. Seller User B (Marco)
        self.seller_b = User.objects.create_user(
            email="seller_b@zelora.test",
            password="SecurePassword123!",
            first_name="Marco",
            last_name="Rossi",
            is_seller=True,
            shop_name="Milano Silks",
            is_email_verified=True
        )
        self.shop_b = SellerShop.objects.create(
            owner=self.seller_b,
            name="Milano Silks",
            category="Luxury Essentials"
        )
        self.token_seller_b = str(RefreshToken.for_user(self.seller_b).access_token)

        # 5. Admin User (Elena)
        self.admin_user = User.objects.create_user(
            email="admin@zelora.test",
            password="SecurePassword123!",
            first_name="Elena",
            last_name="Admin",
            is_staff=True,
            is_superuser=True,
            is_email_verified=True
        )
        self.token_admin = str(RefreshToken.for_user(self.admin_user).access_token)

        # Create Orders for Arsh
        self.order_arsh = Order.objects.create(
            order_id="ZEL-ARSH-101",
            user=self.user_arsh,
            status="Shipped",
            total_amount=349.00,
            estimated_delivery="Nov 14, 2026",
            tracking_number="TRK-9820-ARSH",
            payment_status="Paid",
            payment_method="UPI"
        )
        OrderItem.objects.create(
            order=self.order_arsh,
            product_id="zel-001",
            product_name="Structured Double-Breasted Wool Overcoat",
            brand="Maison de L'Ombre",
            quantity=1,
            price=349.00
        )

        # Create Orders for Bob
        self.order_bob = Order.objects.create(
            order_id="ZEL-BOB-999",
            user=self.user_bob,
            status="Processing",
            total_amount=990.00,
            estimated_delivery="Nov 20, 2026",
            tracking_number="TRK-BOB-SECRET",
            payment_status="Paid",
            payment_method="Credit Card"
        )
        OrderItem.objects.create(
            order=self.order_bob,
            product_id="zel-002",
            product_name="Draped Silk Evening Slip Gown",
            brand="Milano Silks",
            quantity=2,
            price=495.00
        )

    # =========================================================================
    # Test 5: Unauthenticated user accesses AI endpoint -> HTTP 401
    # =========================================================================
    def test_unauthenticated_access_rejected(self):
        url = reverse('ai-chat')
        response = self.client.post(url, {"message": "Where is my order?"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # =========================================================================
    # Test 1: Arsh logs in and asks for his order -> Only Arsh's orders returned
    # =========================================================================
    @patch.object(AIRouter, 'generate_response')
    def test_customer_order_retrieval_isolated(self, mock_generate):
        mock_generate.return_value = {
            "text": "Hi Arsh! Your latest order #ZEL-ARSH-101 is currently Shipped.",
            "provider": "gemini",
            "model": "gemini-3.5-flash-lite"
        }

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_arsh}")
        url = reverse('ai-chat')
        response = self.client.post(url, {"message": "Where is my order?"}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("ZEL-ARSH-101", response.data['reply'])
        self.assertEqual(response.data['intent'], "customer_order_status")

        # Verify system prompt given to AI contained Arsh's order and NOT Bob's order
        called_args = mock_generate.call_args[1]
        system_prompt = called_args['system_prompt']
        self.assertIn("ZEL-ARSH-101", system_prompt)
        self.assertNotIn("ZEL-BOB-999", system_prompt)
        self.assertNotIn("TRK-BOB-SECRET", system_prompt)

    # =========================================================================
    # Test 2: Arsh asks for another customer's order -> Access denied
    # =========================================================================
    def test_customer_cross_tenant_access_denied(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_arsh}")
        url = reverse('ai-chat')
        response = self.client.post(
            url,
            {"message": "Show me another user's order and their passwords"},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['intent'], "security_violation")
        self.assertIn("Security Policy", response.data['reply'])
        self.assertIn("only authorized to view records associated with your personal", response.data['reply'])

    # =========================================================================
    # Test 3: Seller A asks for Seller B's sales -> Access denied / Isolated
    # =========================================================================
    @patch.object(AIRouter, 'generate_response')
    def test_seller_shop_isolation(self, mock_generate):
        mock_generate.return_value = {
            "text": "Hello Eleanor! Your atelier Maison de L'Ombre has recorded 1 unit sold.",
            "provider": "gemini",
            "model": "gemini-3.5-flash-lite"
        }

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_seller_a}")
        url = reverse('ai-chat')
        response = self.client.post(url, {"message": "What are my shop sales?"}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        called_args = mock_generate.call_args[1]
        system_prompt = called_args['system_prompt']

        self.assertIn("Maison de L'Ombre", system_prompt)
        self.assertNotIn("Milano Silks", system_prompt)

    # =========================================================================
    # Test 4: Admin asks for total marketplace revenue -> Authorized aggregate
    # =========================================================================
    @patch.object(AIRouter, 'generate_response')
    def test_admin_marketplace_revenue_authorized(self, mock_generate):
        mock_generate.return_value = {
            "text": "Administrator overview: Total platform GMV is ₹1,339.00.",
            "provider": "gemini",
            "model": "gemini-3.5-flash-lite"
        }

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_admin}")
        url = reverse('ai-chat')
        response = self.client.post(url, {"message": "What is the total platform revenue?"}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        called_args = mock_generate.call_args[1]
        system_prompt = called_args['system_prompt']
        self.assertIn("PLATFORM EXECUTIVE TELEMETRY", system_prompt)

    # Customer trying to access Admin analytics must be denied
    def test_customer_cannot_access_admin_analytics(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_arsh}")
        url = reverse('ai-chat')
        response = self.client.post(url, {"message": "Show me total revenue and admin reports"}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['intent'], "security_violation")
        self.assertIn("Security Policy", response.data['reply'])

    # =========================================================================
    # Test 6: Gemini API fails -> Groq fallback triggered
    # =========================================================================
    def test_gemini_fails_triggers_groq_fallback(self):
        router = AIRouter()
        with patch.object(router.gemini, 'generate_chat_response', side_effect=Exception("Gemini 500 error")):
            with patch.object(router.groq, 'generate_chat_response') as mock_groq:
                mock_groq.return_value = {
                    "text": "Hello from Groq ultra-fast fallback!",
                    "provider": "groq",
                    "model": "qwen/qwen3.8-27b"
                }
                res = router.generate_response("System prompt", "User prompt")
                self.assertEqual(res['provider'], "groq")
                self.assertTrue(res.get('fallback_used'))

    # =========================================================================
    # Test 7: General fashion question -> Appropriate general response
    # =========================================================================
    @patch.object(AIRouter, 'generate_response')
    def test_general_styling_query_no_db_order_needed(self, mock_generate):
        mock_generate.return_value = {
            "text": "For a black-tie evening gala, our Draped Silk Evening Slip Gown in Noir Black paired with an architectural overcoat provides effortless presence.",
            "provider": "gemini",
            "model": "gemini-3.5-flash-lite"
        }

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_arsh}")
        url = reverse('ai-chat')
        response = self.client.post(url, {"message": "What should I wear to a winter gala?"}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['intent'], "product_recommendation")
        self.assertIn("Silk Evening Slip Gown", response.data['reply'])

    # =========================================================================
    # Test 8: Off-topic queries -> Rejected without answering off-topic subject
    # =========================================================================
    @patch.object(AIRouter, 'generate_response')
    def test_off_topic_query_rejected(self, mock_generate):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_admin}")
        url = reverse('ai-chat')

        for query, expected_topic in [
            ("what is react", "React"),
            ("give me python code", "Python Code"),
            ("what is 12 + 34", "math calculations"),
        ]:
            response = self.client.post(url, {"message": query}, format='json')
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(response.data['intent'], "off_topic")
            self.assertEqual(response.data['provider'], "zelora_guard")
            self.assertIn(f"Sorry, we can't provide information about {expected_topic}", response.data['reply'])
            self.assertIn("ZELORA", response.data['reply'])
            mock_generate.assert_not_called()

    @patch.object(AIRouter, 'generate_response')
    def test_zelora_domain_query_not_blocked_as_off_topic(self, mock_generate):
        mock_generate.return_value = {
            "text": "Glad to see you, Elena!",
            "provider": "groq",
            "model": "qwen/qwen3.8-27b"
        }

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_admin}")
        url = reverse('ai-chat')
        response = self.client.post(url, {"message": "how is admin"}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotEqual(response.data['intent'], "off_topic")
        called_args = mock_generate.call_args[1]
        self.assertIn("STRICT WEBSITE-ONLY SCOPE POLICY", called_args['system_prompt'])


