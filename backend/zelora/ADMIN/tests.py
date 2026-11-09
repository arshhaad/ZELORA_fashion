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

    def test_admin_customer_detail_and_notify(self):
        login_resp = self.client.post(reverse('admin-login'), {
            'email': 'superadmin@zelora.luxury',
            'password': 'Password@123'
        })
        token = login_resp.data['tokens']['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        # 1. Customer detail
        detail_url = reverse('admin-customer-detail', kwargs={'user_id': self.regular_user.id})
        resp = self.client.get(detail_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['email'], self.regular_user.email)
        self.assertIn('metrics', resp.data)
        self.assertIn('orders', resp.data)

        # 2. Customer notify
        notify_url = reverse('admin-customer-notify', kwargs={'user_id': self.regular_user.id})
        notif_resp = self.client.post(notify_url, {
            'title': 'Concierge Invitation',
            'message': 'Welcome to the ZELORA Private Circle.',
            'category': 'promotions',
            'priority': 'High'
        })
        self.assertEqual(notif_resp.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', notif_resp.data)

    def test_admin_seller_detail_and_notify(self):
        seller = User.objects.create_user(
            email='seller_test@zelora.luxury',
            password='Password@123',
            first_name='Atelier',
            last_name='Proprietor',
            is_seller=True
        )
        SellerShop.objects.create(
            owner=seller,
            name='Test Luxury Atelier',
            category='Haute Couture'
        )

        login_resp = self.client.post(reverse('admin-login'), {
            'email': 'superadmin@zelora.luxury',
            'password': 'Password@123'
        })
        token = login_resp.data['tokens']['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        # 1. Seller detail
        detail_url = reverse('admin-seller-detail', kwargs={'seller_id': seller.id})
        resp = self.client.get(detail_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['email'], seller.email)
        self.assertIn('shop', resp.data)
        self.assertEqual(resp.data['shop']['name'], 'Test Luxury Atelier')

        # 2. Seller notify
        notify_url = reverse('admin-seller-notify', kwargs={'seller_id': seller.id})
        notif_resp = self.client.post(notify_url, {
            'title': 'Catalog Curation Approved',
            'message': 'Your Autumn/Winter capsule is live.',
            'priority': 'Urgent'
        })
        self.assertEqual(notif_resp.status_code, status.HTTP_201_CREATED)
        self.assertIn('status', notif_resp.data)
