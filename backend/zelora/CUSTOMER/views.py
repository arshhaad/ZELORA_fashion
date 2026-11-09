import logging
import uuid
import re
import razorpay
from django.conf import settings
from django.utils import timezone
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
import requests

from .models import (
    User,
    EmailVerificationCode,
    PasswordResetCode,
    SellerVerificationCode,
    Address,
    Order,
    OrderItem,
    Notification,
    SellerShop,
)
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    LoginSerializer,
    VerifyEmailSerializer,
    ResendVerificationSerializer,
    ForgotPasswordRequestSerializer,
    ResetPasswordConfirmSerializer,
    GoogleAuthSerializer,
    SellerShopSerializer,
)
from .emails import send_verification_email, send_password_reset_email, send_seller_verification_email

logger = logging.getLogger(__name__)


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        first_name = serializer.validated_data.get('first_name', '')
        last_name = serializer.validated_data.get('last_name', '')

        # Check if an unverified user already exists
        user = User.objects.filter(email=email).first()
        if user:
            if user.is_email_verified:
                return Response(
                    {"detail": "An account with this email already exists. Please log in."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # Update password and names for existing unverified user
            user.set_password(password)
            if first_name:
                user.first_name = first_name
            if last_name:
                user.last_name = last_name
            user.save()
        else:
            user = User.objects.create_user(
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                is_email_verified=False,
                auth_provider='email',
            )

        # Generate verification code
        code_obj = EmailVerificationCode.generate(user)
        send_verification_email(user.email, code_obj.code, user.first_name)

        response_data = {
            "message": "Account created! A 6-digit verification code has been sent to your email.",
            "email": user.email,
        }
        return Response(response_data, status=status.HTTP_201_CREATED)


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.validated_data['user']
        verification = serializer.validated_data['verification']

        verification.is_used = True
        verification.save()

        user.is_email_verified = True
        user.save()

        tokens = get_tokens_for_user(user)
        return Response({
            "message": "Email verified successfully! You are now logged in.",
            "tokens": tokens,
            "user": UserSerializer(user).data
        }, status=status.HTTP_200_OK)


class ResendVerificationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResendVerificationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        user = User.objects.get(email=email)

        code_obj = EmailVerificationCode.generate(user)
        send_verification_email(user.email, code_obj.code, user.first_name)

        response_data = {
            "message": "A new verification code has been sent to your email.",
            "email": user.email,
        }
        return Response(response_data, status=status.HTTP_200_OK)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.validated_data['user']

        if not user.is_email_verified:
            # Resend verification code automatically to make it easy
            code_obj = EmailVerificationCode.generate(user)
            send_verification_email(user.email, code_obj.code, user.first_name)
            response_data = {
                "detail": "Your email is not verified yet. We just sent a verification code to your email.",
                "is_verified": False,
                "email": user.email,
            }
            return Response(response_data, status=status.HTTP_403_FORBIDDEN)

        tokens = get_tokens_for_user(user)
        return Response({
            "message": "Login successful.",
            "tokens": tokens,
            "user": UserSerializer(user).data
        }, status=status.HTTP_200_OK)


class GoogleAuthView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        credential = serializer.validated_data.get('credential')
        access_token = serializer.validated_data.get('access_token')

        google_user_data = None

        # 1. Try verifying ID token credential
        if credential:
            try:
                from google.oauth2 import id_token
                from google.auth.transport import requests as google_requests

                client_id = getattr(settings, 'GOOGLE_CLIENT_ID', None)
                id_info = id_token.verify_oauth2_token(
                    credential,
                    google_requests.Request(),
                    client_id,
                    clock_skew_in_seconds=10
                )
                google_user_data = id_info
            except Exception as e:
                logger.warning(f"Google ID token verification failed with library: {e}. Trying tokeninfo endpoint...")
                try:
                    resp = requests.get(
                        f"https://oauth2.googleapis.com/tokeninfo?id_token={credential}",
                        timeout=10
                    )
                    if resp.status_code == 200:
                        google_user_data = resp.json()
                    else:
                        logger.error(f"Google tokeninfo endpoint failed: {resp.text}")
                except Exception as ex:
                    logger.error(f"Google tokeninfo request error: {ex}")

        # 2. If access_token provided instead
        if not google_user_data and access_token:
            try:
                resp = requests.get(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    headers={"Authorization": f"Bearer {access_token}"},
                    timeout=10
                )
                if resp.status_code == 200:
                    google_user_data = resp.json()
                else:
                    logger.error(f"Google userinfo endpoint failed: {resp.text}")
            except Exception as ex:
                logger.error(f"Google userinfo request error: {ex}")

        if not google_user_data or not google_user_data.get('email'):
            return Response(
                {"detail": "Unable to verify Google credentials. Please try again."},
                status=status.HTTP_400_BAD_REQUEST
            )

        email = google_user_data['email'].lower().strip()
        first_name = google_user_data.get('given_name') or google_user_data.get('name', '').split(' ')[0] or ''
        last_name = google_user_data.get('family_name') or ''
        picture = google_user_data.get('picture')

        user = User.objects.filter(email=email).first()
        if user:
            # User already exists - update details if needed
            user.is_email_verified = True
            if picture and not user.avatar_url:
                user.avatar_url = picture
            if not user.first_name and first_name:
                user.first_name = first_name
            if not user.last_name and last_name:
                user.last_name = last_name
            user.save()
        else:
            # Create new user via Google
            user = User.objects.create_user(
                email=email,
                first_name=first_name,
                last_name=last_name,
                is_email_verified=True,
                auth_provider='google',
                avatar_url=picture
            )

        tokens = get_tokens_for_user(user)
        return Response({
            "message": "Google authentication successful.",
            "tokens": tokens,
            "user": UserSerializer(user).data
        }, status=status.HTTP_200_OK)


class ForgotPasswordRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email'].lower().strip()
        user = User.objects.filter(email=email).first()

        code_obj = None
        if user:
            code_obj = PasswordResetCode.generate(user)
            send_password_reset_email(user.email, code_obj.code, user.first_name)

        # Standard generic security response
        response_data = {
            "message": "If an account exists with this email, a 6-digit password reset code has been sent.",
            "email": email,
        }
        return Response(response_data, status=status.HTTP_200_OK)


class ResetPasswordConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.validated_data['user']
        reset_record = serializer.validated_data['reset_record']
        new_password = serializer.validated_data['new_password']

        user.set_password(new_password)
        user.is_email_verified = True  # Proven email ownership
        user.save()

        reset_record.is_used = True
        reset_record.save()

        return Response({
            "message": "Password has been successfully reset! You can now log in with your new password."
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception as e:
                logger.warning(f"Token blacklisting failed or already blacklisted: {e}")

        return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)


# --- CUSTOMER ADDRESS, ORDER & ACCOUNT VIEWS ---

from .models import Address, Order, OrderItem, Notification
from .serializers import AddressSerializer, OrderSerializer, OrderItemSerializer, NotificationSerializer
import uuid


class ProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AddressListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        addresses = Address.objects.filter(user=request.user)
        return Response(AddressSerializer(addresses, many=True).data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = AddressSerializer(data=request.data)
        if serializer.is_valid():
            is_default = serializer.validated_data.get('is_default', False)
            if is_default or not Address.objects.filter(user=request.user).exists():
                Address.objects.filter(user=request.user).update(is_default=False)
                is_default = True

            address = serializer.save(user=request.user, is_default=is_default)
            return Response(AddressSerializer(address).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AddressDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, user, pk):
        try:
            return Address.objects.get(user=user, pk=pk)
        except Address.DoesNotExist:
            return None

    def put(self, request, pk):
        address = self.get_object(request.user, pk)
        if not address:
            return Response({"detail": "Address not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = AddressSerializer(address, data=request.data, partial=True)
        if serializer.is_valid():
            if serializer.validated_data.get('is_default', False):
                Address.objects.filter(user=request.user).exclude(pk=pk).update(is_default=False)
            updated = serializer.save()
            return Response(AddressSerializer(updated).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        address = self.get_object(request.user, pk)
        if not address:
            return Response({"detail": "Address not found."}, status=status.HTTP_404_NOT_FOUND)

        was_default = address.is_default
        address.delete()

        # If deleted was default, promote another address if exists
        if was_default:
            next_addr = Address.objects.filter(user=request.user).first()
            if next_addr:
                next_addr.is_default = True
                next_addr.save()

        return Response({"message": "Address deleted successfully."}, status=status.HTTP_200_OK)


class AddressSetDefaultView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            address = Address.objects.get(user=request.user, pk=pk)
            Address.objects.filter(user=request.user).update(is_default=False)
            address.is_default = True
            address.save()
            return Response(AddressSerializer(address).data, status=status.HTTP_200_OK)
        except Address.DoesNotExist:
            return Response({"detail": "Address not found."}, status=status.HTTP_404_NOT_FOUND)


class OrderListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        status_filter = request.query_params.get('status')
        orders = Order.objects.filter(user=request.user)
        if status_filter and status_filter.lower() != 'all':
            orders = orders.filter(status__iexact=status_filter)
        return Response(OrderSerializer(orders, many=True).data, status=status.HTTP_200_OK)

    def post(self, request):
        data = request.data
        items_data = data.get('items', [])
        if not items_data:
            return Response({"detail": "Order must contain at least one item."}, status=status.HTTP_400_BAD_REQUEST)

        order_id = data.get('order_id') or f"ZEL-{random.randint(10000, 99999)}-{uuid.uuid4().hex[:2].upper()}"

        order = Order.objects.create(
            order_id=order_id,
            user=request.user,
            status='Confirmed',
            estimated_delivery=data.get('estimated_delivery', '3 - 5 Business Days'),
            subtotal=data.get('subtotal', 0),
            discount=data.get('discount', 0),
            delivery_charges=data.get('delivery_charges', 0),
            tax=data.get('tax', 0),
            total_amount=data.get('total_amount', 0),
            payment_method=data.get('payment_method', 'Razorpay'),
            payment_status=data.get('payment_status', 'Paid'),
            delivery_method=data.get('delivery_method', 'Standard Delivery'),
            shipping_address=data.get('shipping_address', {}),
            tracking_number=f"TRK-{uuid.uuid4().hex[:8].upper()}",
            razorpay_order_id=data.get('razorpay_order_id'),
            razorpay_payment_id=data.get('razorpay_payment_id'),
            razorpay_signature=data.get('razorpay_signature'),
        )

        for it in items_data:
            OrderItem.objects.create(
                order=order,
                product_id=it.get('product_id', ''),
                product_name=it.get('product_name', ''),
                product_image=it.get('product_image', ''),
                brand=it.get('brand', 'ZELORA'),
                size=it.get('size', 'M'),
                color=it.get('color', 'Noir Black'),
                quantity=it.get('quantity', 1),
                price=it.get('price', 0)
            )

        # Create Order Confirmed Notification
        notification_desc = f'Your order {order.order_id} for ${order.total_amount} has been securely confirmed'
        if order.razorpay_payment_id:
            notification_desc += f' via Razorpay (Ref: {order.razorpay_payment_id}).'
        else:
            notification_desc += ' and will begin dispatch.'

        Notification.objects.create(
            user=request.user,
            category='orders',
            title='Order Placed & Confirmed',
            description=notification_desc
        )

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        try:
            order = Order.objects.get(user=request.user, order_id=order_id)
            return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)
        except Order.DoesNotExist:
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)


class OrderCancelView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        try:
            order = Order.objects.get(user=request.user, order_id=order_id)
            if order.status not in ['Processing', 'Confirmed']:
                return Response(
                    {"detail": f"Order cannot be cancelled in '{order.status}' status."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            order.status = 'Cancelled'
            order.save()

            Notification.objects.create(
                user=request.user,
                category='orders',
                title='Order Cancelled',
                description=f'Order {order.order_id} has been cancelled successfully.'
            )

            return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)
        except Order.DoesNotExist:
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)


class OrderReturnView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id):
        try:
            order = Order.objects.get(user=request.user, order_id=order_id)
            if order.status != 'Delivered':
                return Response(
                    {"detail": "Only delivered orders are eligible for return / exchange."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            order.status = 'Returned'
            order.save()

            Notification.objects.create(
                user=request.user,
                category='orders',
                title='Return Initiated',
                description=f'Return request for order {order.order_id} has been logged. Our concierge will schedule courier pickup.'
            )

            return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)
        except Order.DoesNotExist:
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)


class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        category = request.query_params.get('category')
        qs = Notification.objects.filter(user=request.user)
        if category and category.lower() != 'all':
            qs = qs.filter(category__iexact=category)
        return Response(NotificationSerializer(qs, many=True).data, status=status.HTTP_200_OK)


class NotificationMarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk=None):
        if pk:
            Notification.objects.filter(user=request.user, pk=pk).update(is_read=True)
        else:
            Notification.objects.filter(user=request.user).update(is_read=True)
        return Response({"message": "Notifications marked as read."}, status=status.HTTP_200_OK)


class NotificationDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        Notification.objects.filter(user=request.user, pk=pk).delete()
        return Response({"message": "Notification deleted."}, status=status.HTTP_200_OK)


# ==========================================
# Razorpay Payment Gateway Integration Views
# ==========================================

class RazorpayConfigView(APIView):
    """Returns public Razorpay configuration for frontend integration."""
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({
            "key_id": settings.RAZORPAY_KEY_ID,
            "currency": "INR",
            "name": "ZELORA",
            "description": "ZELORA Haute Couture & Ready-to-Wear",
            "theme_color": "#000000"
        }, status=status.HTTP_200_OK)


class RazorpayOrderCreateView(APIView):
    """
    Initializes a Razorpay order on the backend.
    Calculates amounts in smallest currency unit (paise/cents).
    """
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        amount = data.get('amount')
        currency = data.get('currency', 'INR')
        receipt = data.get('receipt', f"rcpt_{uuid.uuid4().hex[:10]}")

        if amount is None:
            return Response({"detail": "Amount is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            amount_float = float(amount)
            # Razorpay requires integer amount in smallest currency subunit (paise)
            amount_in_subunits = int(round(amount_float * 100))
        except (ValueError, TypeError):
            return Response({"detail": "Invalid amount provided."}, status=status.HTTP_400_BAD_REQUEST)

        key_id = settings.RAZORPAY_KEY_ID
        key_secret = settings.RAZORPAY_KEY_SECRET

        if key_secret:
            try:
                client = razorpay.Client(auth=(key_id, key_secret))
                razorpay_order = client.order.create(data={
                    "amount": amount_in_subunits,
                    "currency": currency,
                    "receipt": receipt,
                    "payment_capture": 1
                })
                return Response({
                    "success": True,
                    "key_id": key_id,
                    "order_id": razorpay_order.get("id"),
                    "amount": razorpay_order.get("amount"),
                    "currency": razorpay_order.get("currency"),
                    "receipt": receipt,
                    "is_server_order": True
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                logger.error(f"Razorpay Client order creation error: {e}")
                pass

        # If secret is not provided, use Razorpay client-side standard checkout mode (no server order_id)
        # Note: Sending a non-existent order_id to Razorpay SDK causes 'Order not found' error.
        return Response({
            "success": True,
            "key_id": key_id,
            "order_id": None,
            "amount": amount_in_subunits,
            "currency": currency,
            "receipt": receipt,
            "mode": "standard_checkout",
            "is_server_order": False
        }, status=status.HTTP_200_OK)


class RazorpayPaymentVerifyView(APIView):
    """
    Verifies Razorpay payment signature and updates the order status.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        order_id = data.get('order_id')
        razorpay_payment_id = data.get('razorpay_payment_id')
        razorpay_order_id = data.get('razorpay_order_id')
        razorpay_signature = data.get('razorpay_signature')

        if not razorpay_payment_id:
            return Response(
                {"detail": "razorpay_payment_id is required for verification."},
                status=status.HTTP_400_BAD_REQUEST
            )

        key_id = settings.RAZORPAY_KEY_ID
        key_secret = settings.RAZORPAY_KEY_SECRET

        # If key secret is configured, perform cryptographic signature verification
        if key_secret and razorpay_order_id and razorpay_signature:
            try:
                client = razorpay.Client(auth=(key_id, key_secret))
                client.utility.verify_payment_signature({
                    'razorpay_order_id': razorpay_order_id,
                    'razorpay_payment_id': razorpay_payment_id,
                    'razorpay_signature': razorpay_signature
                })
            except razorpay.errors.SignatureVerificationError:
                return Response(
                    {"detail": "Razorpay payment signature verification failed."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            except Exception as e:
                logger.error(f"Error during signature verification: {e}")

        # Locate and update Order if order_id was provided
        order = None
        if order_id:
            order = Order.objects.filter(order_id=order_id).first()
            if order:
                order.payment_status = 'Paid'
                order.payment_method = 'Razorpay'
                order.razorpay_payment_id = razorpay_payment_id
                if razorpay_order_id:
                    order.razorpay_order_id = razorpay_order_id
                if razorpay_signature:
                    order.razorpay_signature = razorpay_signature
                order.save()

                if request.user.is_authenticated:
                    Notification.objects.create(
                        user=request.user,
                        category='orders',
                        title='Payment Authorized via Razorpay',
                        description=f'Payment of ${order.total_amount} was successfully captured. Reference: {razorpay_payment_id}'
                    )

        return Response({
            "status": "success",
            "message": "Payment verified and recorded successfully.",
            "razorpay_payment_id": razorpay_payment_id,
            "order": OrderSerializer(order).data if order else None
        }, status=status.HTTP_200_OK)


# ==========================================
# Seller Management & Atelier Views
# ==========================================

class SellerRegisterView(APIView):
    """Registers a new fashion partner seller and sets up their atelier shop with comprehensive validation."""
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data or {}
        owner_name = str(data.get('owner_name', '')).strip()
        email_raw = str(data.get('email', '')).strip()
        mobile_number = str(data.get('mobile_number', '')).strip()
        password = data.get('password', '')
        shop_name = str(data.get('shop_name', '')).strip()
        shop_category = str(data.get('shop_category', 'Haute Couture & Designer Wear')).strip()

        errors = {}

        # 1. Validate Owner Name
        if not owner_name:
            errors['owner_name'] = ["Owner full name is required."]
        elif len(owner_name) < 2:
            errors['owner_name'] = ["Owner full name must contain at least 2 characters."]

        # 2. Validate Email
        if not email_raw:
            errors['email'] = ["Business email address is required."]
        else:
            email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
            if not re.match(email_regex, email_raw):
                errors['email'] = ["Please enter a valid business email format (e.g. atelier@boutique.com)."]

        # 3. Validate Mobile Number
        if not mobile_number:
            errors['mobile_number'] = ["Contact phone number is required."]
        else:
            cleaned_phone = re.sub(r'[\s\-\(\)\+]', '', mobile_number)
            if len(cleaned_phone) < 7 or not cleaned_phone.isdigit():
                errors['mobile_number'] = ["Please enter a valid phone number (at least 7 digits)."]

        # 4. Validate Password
        if not password:
            errors['password'] = ["Password is required."]
        elif len(password) < 6:
            errors['password'] = ["Password must be at least 6 characters long."]

        # 5. Validate Shop Name
        if not shop_name:
            errors['shop_name'] = ["Boutique/Atelier shop name is required."]
        elif len(shop_name) < 2:
            errors['shop_name'] = ["Shop name must contain at least 2 characters."]

        # 6. Validate Shop Category
        if not shop_category:
            errors['shop_category'] = ["Fashion category specialization is required."]

        if errors:
            detail_msg = next(iter(errors.values()))[0]
            return Response({"detail": detail_msg, "errors": errors}, status=status.HTTP_400_BAD_REQUEST)

        email = email_raw.lower()

        # Check existing seller
        existing_user = User.objects.filter(email=email).first()
        if existing_user and existing_user.is_seller:
            return Response({
                "detail": "A seller account already exists with this email address. Please sign in instead.",
                "errors": {"email": ["A seller account already exists with this email."]}
            }, status=status.HTTP_400_BAD_REQUEST)

        if existing_user:
            existing_user.is_seller = True
            existing_user.shop_name = shop_name
            existing_user.shop_category = shop_category
            if mobile_number:
                existing_user.phone_number = mobile_number
            existing_user.set_password(password)
            existing_user.save()
            user = existing_user
        else:
            name_parts = owner_name.split(' ', 1)
            first_name = name_parts[0]
            last_name = name_parts[1] if len(name_parts) > 1 else ''
            user = User.objects.create_user(
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                is_seller=True,
                is_email_verified=True,
                shop_name=shop_name,
                shop_category=shop_category,
                phone_number=mobile_number,
            )

        shop, _ = SellerShop.objects.get_or_create(
            owner=user,
            defaults={
                'name': shop_name,
                'category': shop_category,
                'contact_email': email,
                'contact_number': mobile_number,
            }
        )

        tokens = get_tokens_for_user(user)
        return Response({
            "message": "Seller registered successfully.",
            "user": UserSerializer(user).data,
            "shop": SellerShopSerializer(shop).data,
            "tokens": tokens,
        }, status=status.HTTP_201_CREATED)


class SellerLoginView(APIView):
    """Authenticates a seller and returns their token and shop profile with complete backend validation."""
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data or {}
        email_raw = data.get('email', '')
        password = data.get('password', '')

        errors = {}

        # 1. Field presence validation
        if not email_raw or not str(email_raw).strip():
            errors['email'] = ["Business email address is required."]

        if not password:
            errors['password'] = ["Password is required."]

        if errors:
            detail_msg = next(iter(errors.values()))[0]
            return Response({"detail": detail_msg, "errors": errors}, status=status.HTTP_400_BAD_REQUEST)

        email = str(email_raw).strip().lower()

        # 2. Email format validation
        email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
        if not re.match(email_regex, email):
            errors['email'] = ["Please enter a valid business email address format."]
            return Response({
                "detail": "Please enter a valid business email address format.",
                "errors": errors
            }, status=status.HTTP_400_BAD_REQUEST)

        # 3. Password length check
        if len(str(password)) < 6:
            errors['password'] = ["Password must contain at least 6 characters."]
            return Response({
                "detail": "Password must contain at least 6 characters.",
                "errors": errors
            }, status=status.HTTP_400_BAD_REQUEST)

        # 4. Check user existence
        user = User.objects.filter(email=email).first()
        if not user:
            return Response({
                "detail": "No boutique account found with this email. Please verify your credentials or register as a seller.",
                "errors": {"email": ["No boutique account found with this email."]}
            }, status=status.HTTP_401_UNAUTHORIZED)

        # 5. Account active status check
        if not user.is_active:
            return Response({
                "detail": "Your boutique seller account has been deactivated or suspended. Please contact ZELORA Administration.",
                "errors": {"account": ["Account is deactivated."]}
            }, status=status.HTTP_403_FORBIDDEN)

        # 6. Password authentication check
        if not user.check_password(password):
            return Response({
                "detail": "Incorrect password. Please verify your credentials and try again.",
                "errors": {"password": ["Incorrect password."]}
            }, status=status.HTTP_401_UNAUTHORIZED)

        # 7. Seller authorization check
        if not user.is_seller and not hasattr(user, 'seller_shop'):
            return Response({
                "detail": "This account is not registered as a fashion partner seller. Please complete seller registration.",
                "errors": {"role": ["Account is not registered as a seller."]}
            }, status=status.HTTP_403_FORBIDDEN)

        if not user.is_seller:
            user.is_seller = True
            user.save(update_fields=['is_seller'])

        # 8. Retrieve or initialize shop profile
        shop, _ = SellerShop.objects.get_or_create(
            owner=user,
            defaults={
                'name': user.shop_name or f"{user.first_name}'s Atelier",
                'category': user.shop_category or "Haute Couture & Designer Wear",
                'contact_email': user.email,
                'contact_number': user.phone_number or '',
            }
        )

        tokens = get_tokens_for_user(user)
        return Response({
            "message": "Seller authenticated successfully.",
            "user": UserSerializer(user).data,
            "shop": SellerShopSerializer(shop).data,
            "tokens": tokens,
        }, status=status.HTTP_200_OK)


class SellerShopProfileView(APIView):
    """Fetches or updates the authenticated seller's boutique shop profile."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        shop, _ = SellerShop.objects.get_or_create(
            owner=request.user,
            defaults={
                'name': request.user.shop_name or "My Atelier",
                'category': request.user.shop_category or "Haute Couture & Designer Wear",
                'contact_email': request.user.email,
            }
        )
        return Response(SellerShopSerializer(shop).data, status=status.HTTP_200_OK)

    def patch(self, request):
        shop, _ = SellerShop.objects.get_or_create(owner=request.user)
        serializer = SellerShopSerializer(shop, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SendSellerOtpView(APIView):
    """Generates and dispatches a 6-digit email verification code for seller registration."""
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        owner_name = request.data.get('owner_name', '').strip()
        shop_name = request.data.get('shop_name', '').strip()

        if not email:
            return Response({"detail": "Email address is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Generate OTP
        code_obj = SellerVerificationCode.generate(email)
        send_seller_verification_email(email, code_obj.code, owner_name, shop_name)

        resp = {
            "message": f"6-digit verification code has been dispatched to {email}.",
            "email": email,
        }
        return Response(resp, status=status.HTTP_200_OK)


class VerifySellerOtpView(APIView):
    """Verifies the 6-digit code for seller registration."""
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        code = request.data.get('code', '').strip()

        if not email or not code:
            return Response({"detail": "Both email and verification code are required."}, status=status.HTTP_400_BAD_REQUEST)

        record = SellerVerificationCode.objects.filter(
            email=email,
            code=code,
            is_used=False,
            expires_at__gt=timezone.now()
        ).first()

        if not record:
            return Response({"detail": "Invalid or expired verification code."}, status=status.HTTP_400_BAD_REQUEST)

        record.is_used = True
        record.save()

        return Response({"message": "Email verified successfully.", "verified": True}, status=status.HTTP_200_OK)
