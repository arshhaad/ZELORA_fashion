from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from CUSTOMER.models import User, SellerShop


class SellerAuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create verified seller
        self.seller_user = User.objects.create_user(
            email='atelier@maisondelombre.luxury',
            password='Couture2026!',
            first_name='Eleanor',
            last_name='Vance',
            is_seller=True,
            is_email_verified=True,
            shop_name="Maison de L'Ombre",
            shop_category='Haute Couture & Designer Wear'
        )
        self.seller_shop = SellerShop.objects.create(
            owner=self.seller_user,
            name="Maison de L'Ombre",
            category='Haute Couture & Designer Wear',
            contact_email='atelier@maisondelombre.luxury',
            is_open=True
        )

        # Create regular customer (non-seller)
        self.customer_user = User.objects.create_user(
            email='customer@example.com',
            password='CustomerPassword123!',
            first_name='John',
            last_name='Doe',
            is_seller=False,
            is_email_verified=True
        )

    def test_login_missing_fields_returns_400(self):
        response = self.client.post('/api/auth/seller/login/', {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data.get('errors', {}))
        self.assertIn('password', response.data.get('errors', {}))

    def test_login_invalid_email_format_returns_400(self):
        response = self.client.post('/api/auth/seller/login/', {
            'email': 'not-an-email',
            'password': 'Couture2026!'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data.get('errors', {}))

    def test_login_short_password_returns_400(self):
        response = self.client.post('/api/auth/seller/login/', {
            'email': 'atelier@maisondelombre.luxury',
            'password': '123'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data.get('errors', {}))

    def test_login_nonexistent_user_returns_401(self):
        response = self.client.post('/api/auth/seller/login/', {
            'email': 'unknown.atelier@luxury.test',
            'password': 'Password123!'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('No boutique account found', response.data.get('detail', ''))

    def test_login_wrong_password_returns_401(self):
        response = self.client.post('/api/auth/seller/login/', {
            'email': 'atelier@maisondelombre.luxury',
            'password': 'WrongPassword123!'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('Incorrect password', response.data.get('detail', ''))

    def test_login_customer_non_seller_returns_403(self):
        response = self.client.post('/api/auth/seller/login/', {
            'email': 'customer@example.com',
            'password': 'CustomerPassword123!'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('not registered as a fashion partner seller', response.data.get('detail', ''))

    def test_login_success(self):
        response = self.client.post('/api/auth/seller/login/', {
            'email': 'atelier@maisondelombre.luxury',
            'password': 'Couture2026!'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])
        self.assertEqual(response.data['user']['email'], 'atelier@maisondelombre.luxury')
        self.assertEqual(response.data['shop']['name'], "Maison de L'Ombre")

    def test_register_seller_validation_and_creation(self):
        # 1. Missing fields
        bad_resp = self.client.post('/api/auth/seller/register/', {}, format='json')
        self.assertEqual(bad_resp.status_code, status.HTTP_400_BAD_REQUEST)

        # 2. Valid registration
        valid_resp = self.client.post('/api/auth/seller/register/', {
            'owner_name': 'Alexander Vane',
            'email': 'vane.atelier@fashion.test',
            'mobile_number': '+91 98765 43210',
            'password': 'AtelierPassword2026!',
            'shop_name': 'Atelier Vane',
            'shop_category': 'Outerwear & Tailoring'
        }, format='json')
        self.assertEqual(valid_resp.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', valid_resp.data)
        self.assertEqual(valid_resp.data['shop']['name'], 'Atelier Vane')
        self.assertTrue(User.objects.filter(email='vane.atelier@fashion.test', is_seller=True).exists())
