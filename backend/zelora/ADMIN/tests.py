from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from CUSTOMER.models import User, SellerShop
from .models import PlatformSetting


class AdminAuthenticationAndModulesTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            email='superadmin@zelora.luxury',
            password='Password@123',
            first_name='Super',
            last_name='Admin'
        )
        self.regular_user = User.objects.create_user(
            email='regular@example.com',
            password='Password@123',
            first_name='Regular',
            last_name='Customer'
        )

    def test_admin_login_success(self):
        url = reverse('admin-login')
        resp = self.client.post(url, {
            'email': 'superadmin@zelora.luxury',
            'password': 'Password@123'
        })
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', resp.data)
        self.assertEqual(resp.data['user']['role'], 'Super Admin')

    def test_regular_user_cannot_access_admin_login(self):
        url = reverse('admin-login')
        resp = self.client.post(url, {
            'email': 'regular@example.com',
            'password': 'Password@123'
        })
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_metrics_access(self):
        # Authenticate admin
        login_resp = self.client.post(reverse('admin-login'), {
            'email': 'superadmin@zelora.luxury',
            'password': 'Password@123'
        })
        token = login_resp.data['tokens']['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        metrics_url = reverse('admin-metrics')
        resp = self.client.get(metrics_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('metrics', resp.data)
        self.assertIn('total_sales', resp.data['metrics'])
