from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import User, EmailVerificationCode, PasswordResetCode


class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('auth-register')
        self.login_url = reverse('auth-login')
        self.verify_url = reverse('auth-verify-email')
        self.resend_verify_url = reverse('auth-resend-verification')
        self.forgot_pw_url = reverse('auth-forgot-password')
        self.reset_pw_url = reverse('auth-reset-password')
        self.logout_url = reverse('auth-logout')
        self.me_url = reverse('auth-me')

    def test_registration_and_email_verification(self):
        # 1. Register
        resp = self.client.post(self.register_url, {
            'email': 'customer1@example.com',
            'password': 'password123',
            'first_name': 'Alice',
            'last_name': 'Smith'
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertIn('email', resp.data)
        user = User.objects.get(email='customer1@example.com')
        self.assertFalse(user.is_email_verified)

        # 2. Try login before verification
        login_resp = self.client.post(self.login_url, {
            'email': 'customer1@example.com',
            'password': 'password123'
        })
        self.assertEqual(login_resp.status_code, status.HTTP_403_FORBIDDEN)

        # 3. Verify email with code
        code_obj = EmailVerificationCode.objects.filter(user=user, is_used=False).latest('created_at')
        verify_resp = self.client.post(self.verify_url, {
            'email': 'customer1@example.com',
            'code': code_obj.code
        })
        self.assertEqual(verify_resp.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', verify_resp.data)
        user.refresh_from_db()
        self.assertTrue(user.is_email_verified)

        # 4. Now login successfully
        login_resp = self.client.post(self.login_url, {
            'email': 'customer1@example.com',
            'password': 'password123'
        })
        self.assertEqual(login_resp.status_code, status.HTTP_200_OK)
        access_token = login_resp.data['tokens']['access']

        # 5. Access protected /me/ endpoint
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        me_resp = self.client.get(self.me_url)
        self.assertEqual(me_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(me_resp.data['email'], 'customer1@example.com')

    def test_forgot_and_reset_password(self):
        user = User.objects.create_user(
            email='customer2@example.com',
            password='oldpassword123',
            first_name='Bob',
            is_email_verified=True
        )

        # 1. Request forgot password
        forgot_resp = self.client.post(self.forgot_pw_url, {
            'email': 'customer2@example.com'
        })
        self.assertEqual(forgot_resp.status_code, status.HTTP_200_OK)

        reset_obj = PasswordResetCode.objects.filter(user=user, is_used=False).latest('created_at')

        # 2. Reset password
        reset_resp = self.client.post(self.reset_pw_url, {
            'email': 'customer2@example.com',
            'code': reset_obj.code,
            'new_password': 'newpassword456'
        })
        self.assertEqual(reset_resp.status_code, status.HTTP_200_OK)

        # 3. Old password should fail
        fail_login = self.client.post(self.login_url, {
            'email': 'customer2@example.com',
            'password': 'oldpassword123'
        })
        self.assertEqual(fail_login.status_code, status.HTTP_400_BAD_REQUEST)

        # 4. New password should succeed
        success_login = self.client.post(self.login_url, {
            'email': 'customer2@example.com',
            'password': 'newpassword456'
        })
        self.assertEqual(success_login.status_code, status.HTTP_200_OK)

    def test_logout(self):
        user = User.objects.create_user(
            email='customer3@example.com',
            password='password123',
            is_email_verified=True
        )
        login_resp = self.client.post(self.login_url, {
            'email': 'customer3@example.com',
            'password': 'password123'
        })
        refresh_token = login_resp.data['tokens']['refresh']

        logout_resp = self.client.post(self.logout_url, {'refresh': refresh_token})
        self.assertEqual(logout_resp.status_code, status.HTTP_200_OK)

    def test_google_auth_validation_and_flow(self):
        google_url = reverse('auth-google')

        # 1. Missing both credential and access_token -> 400
        empty_resp = self.client.post(google_url, {})
        self.assertEqual(empty_resp.status_code, status.HTTP_400_BAD_REQUEST)

        # 2. Mocking Google userinfo response
        from unittest.mock import patch, MagicMock

        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            'email': 'google_user@zelora.luxury',
            'given_name': 'Genevieve',
            'family_name': 'Laurent',
            'picture': 'https://lh3.googleusercontent.com/avatar.jpg'
        }

        with patch('requests.get', return_value=mock_resp):
            resp = self.client.post(google_url, {
                'access_token': 'mock-valid-google-access-token'
            })
            self.assertEqual(resp.status_code, status.HTTP_200_OK)
            self.assertIn('tokens', resp.data)
            self.assertEqual(resp.data['user']['email'], 'google_user@zelora.luxury')
            self.assertEqual(resp.data['user']['first_name'], 'Genevieve')

            # Verify user exists in database
            user = User.objects.get(email='google_user@zelora.luxury')
            self.assertTrue(user.is_email_verified)
            self.assertEqual(user.auth_provider, 'google')

        # 3. Repeat login with existing Google user
        with patch('requests.get', return_value=mock_resp):
            resp2 = self.client.post(google_url, {
                'credential': 'mock-valid-id-token'
            })
            self.assertEqual(resp2.status_code, status.HTTP_200_OK)
            self.assertIn('tokens', resp2.data)
