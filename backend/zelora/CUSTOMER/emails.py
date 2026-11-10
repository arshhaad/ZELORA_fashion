import logging
from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)

COMMON_DOMAIN_TYPOS = {
    'gamil.com': 'gmail.com',
    'gmal.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'gmial.com': 'gmail.com',
    'gmaill.com': 'gmail.com',
    'yaho.com': 'yahoo.com',
    'yahooo.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
    'outlok.com': 'outlook.com',
}


def normalize_email_address(email: str) -> str:
    """Cleans, lowercases, and fixes common typos (e.g. gamil.com -> gmail.com)."""
    clean = str(email).strip().lower()
    if '@' in clean:
        local, domain = clean.rsplit('@', 1)
        if domain in COMMON_DOMAIN_TYPOS:
            clean = f"{local}@{COMMON_DOMAIN_TYPOS[domain]}"
    return clean


def _get_from_email():
    """Returns valid sender address matching authenticated Google SMTP credentials."""
    host_user = getattr(settings, 'EMAIL_HOST_USER', None)
    default_from = getattr(settings, 'DEFAULT_FROM_EMAIL', None)
    email_addr = default_from or host_user or 'noreply@zelora.luxury'
    if '<' not in email_addr and '@' in email_addr:
        return f"ZELORA Atelier <{email_addr}>"
    return email_addr


def send_verification_email(email, code, first_name=""):
    """Dispatches a 6-digit email verification OTP to a customer's real email inbox."""
    clean_recipient = normalize_email_address(email)
    app_name = getattr(settings, 'APP_NAME', 'ZELORA')
    subject = f"[{app_name}] Your 6-Digit Email Verification Code: {code}"
    name_display = first_name.strip() if first_name else "Valued Client"

    message = f"""Hello {name_display},

Welcome to {app_name} — The Architecture of Modern Luxury.

Your 6-digit verification code is:
{code}

This code is valid for 15 minutes.
Please enter this code on the verification page to activate your customer account.

If you did not request this verification, please safely disregard this email.

Warm regards,
The {app_name} Concierge Team
https://zelora.luxury
"""

    html_message = f"""
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 40px 32px; background-color: #F8F5F0; border-radius: 12px; border: 1px solid #E8DED1; color: #292522;">
        <div style="text-align: center; margin-bottom: 28px;">
            <h1 style="font-size: 26px; font-weight: 800; letter-spacing: 5px; margin: 0 0 6px 0; color: #111111;">ZELORA</h1>
            <p style="font-size: 11px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; color: #B69A70; margin: 0;">CLIENT CONCIERGE &bull; VERIFICATION</p>
        </div>

        <div style="background-color: #FFFFFF; border-radius: 10px; padding: 32px 28px; box-shadow: 0 4px 16px rgba(0,0,0,0.04); border: 1px solid #EFEAE3;">
            <p style="font-size: 15px; margin-top: 0; color: #292522;">Hello <strong>{name_display}</strong>,</p>
            <p style="font-size: 14px; line-height: 1.6; color: #555555; margin-bottom: 24px;">
                Thank you for creating your account with <strong>{app_name}</strong>. Please use the single-use 6-digit security code below to confirm your email and access your curated collections:
            </p>

            <div style="text-align: center; margin: 32px 0;">
                <div style="display: inline-block; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #111111; background-color: #F8F5F0; padding: 16px 36px; border-radius: 8px; border: 1.5px solid #B69A70;">
                    {code}
                </div>
                <p style="font-size: 12px; color: #888888; margin-top: 10px; letter-spacing: 0.5px;">Expires in 15 minutes &bull; Single-use only</p>
            </div>

            <p style="font-size: 13px; line-height: 1.5; color: #777777; margin-bottom: 0;">
                Never share this verification code with anyone. ZELORA concierge staff will never request your code.
            </p>
        </div>

        <div style="text-align: center; margin-top: 28px;">
            <p style="font-size: 11px; color: #999999; margin: 0 0 4px 0;">&copy; {app_name} Atelier Inc. All rights reserved.</p>
            <p style="font-size: 10px; color: #AAAAAA; margin: 0;">Paris &bull; Milan &bull; New York &bull; Tokyo &bull; London</p>
        </div>
    </div>
    """

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=_get_from_email(),
            recipient_list=[clean_recipient],
            html_message=html_message,
            fail_silently=False,
        )
        logger.info(f"Verification email successfully dispatched to {clean_recipient}")
        return True, "Email dispatched successfully"
    except Exception as e:
        logger.error(f"SMTP dispatch error for {clean_recipient}: {e}", exc_info=True)
        return False, str(e)


def send_seller_verification_email(email, code, owner_name="", shop_name=""):
    """Dispatches a 6-digit partner boutique verification OTP directly to a seller's real email inbox via SMTP."""
    clean_recipient = normalize_email_address(email)
    app_name = getattr(settings, 'APP_NAME', 'ZELORA')
    subject = f"[{app_name} Atelier] Seller Verification Code: {code}"
    owner_display = owner_name.strip() if owner_name else "Atelier Partner"
    boutique_display = shop_name.strip() if shop_name else "Your Boutique"

    message = f"""Hello {owner_display},

Thank you for applying to launch '{boutique_display}' on ZELORA.

Your 6-digit partner verification code is:
{code}

This code is valid for 15 minutes.
Enter this code on your seller onboarding screen to proceed to the registration deposit.

Warm regards,
The {app_name} Merchant Partner Desk
https://zelora.luxury/seller
"""

    html_message = f"""
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 40px 32px; background-color: #30251F; border-radius: 12px; color: #F8F5F0;">
        <div style="text-align: center; margin-bottom: 28px;">
            <h1 style="font-size: 26px; font-weight: 800; letter-spacing: 5px; margin: 0 0 6px 0; color: #FFFFFF;">ZELORA</h1>
            <p style="font-size: 11px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; color: #B69A70; margin: 0;">PARTNER ATELIER ONBOARDING &bull; OTP</p>
        </div>

        <div style="background-color: #FFFFFF; border-radius: 10px; padding: 32px 28px; box-shadow: 0 4px 16px rgba(0,0,0,0.12); color: #292522;">
            <p style="font-size: 15px; margin-top: 0; color: #292522;">Hello <strong>{owner_display}</strong>,</p>
            <p style="font-size: 14px; line-height: 1.6; color: #555555; margin-bottom: 20px;">
                We are thrilled to welcome <strong>{boutique_display}</strong> to the ZELORA designer collective. Please verify your business email with the following single-use verification code:
            </p>

            <div style="text-align: center; margin: 28px 0;">
                <div style="display: inline-block; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #30251F; background-color: #F8F5F0; padding: 16px 36px; border-radius: 8px; border: 1.5px solid #B69A70;">
                    {code}
                </div>
                <p style="font-size: 12px; color: #888888; margin-top: 10px;">Expires in 15 minutes &bull; Single-use security token</p>
            </div>

            <p style="font-size: 13px; line-height: 1.5; color: #777777; margin-bottom: 0;">
                Once verified, your boutique profile will be submitted for admin accreditation.
            </p>
        </div>

        <div style="text-align: center; margin-top: 24px;">
            <p style="font-size: 11px; color: #E8DED1; opacity: 0.7; margin: 0;">&copy; {app_name} Merchant Operations &bull; Global Atelier Network</p>
        </div>
    </div>
    """

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=_get_from_email(),
            recipient_list=[clean_recipient],
            html_message=html_message,
            fail_silently=False,
        )
        logger.info(f"Seller verification email successfully dispatched to {clean_recipient}")
        return True, "Email dispatched successfully"
    except Exception as e:
        logger.error(f"SMTP dispatch error for {clean_recipient}: {e}", exc_info=True)
        return False, str(e)


def send_password_reset_email(email, code, first_name=""):
    """Dispatches a password reset OTP code directly to a user's real email inbox via SMTP."""
    clean_recipient = normalize_email_address(email)
    app_name = getattr(settings, 'APP_NAME', 'ZELORA')
    subject = f"[{app_name}] Password Reset Verification Code: {code}"
    name_display = first_name.strip() if first_name else "Valued Client"

    message = f"""Hello {name_display},

We received a request to reset your password for your {app_name} account.

Your 6-digit password reset code is:
{code}

This code will expire in 15 minutes.
If you did not request this change, your account remains secure and no action is required.

Warm regards,
The {app_name} Security Team
"""

    html_message = f"""
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 40px 32px; background-color: #F8F5F0; border-radius: 12px; border: 1px solid #E8DED1; color: #292522;">
        <div style="text-align: center; margin-bottom: 28px;">
            <h1 style="font-size: 26px; font-weight: 800; letter-spacing: 5px; margin: 0 0 6px 0; color: #111111;">ZELORA</h1>
            <p style="font-size: 11px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; color: #B69A70; margin: 0;">ACCOUNT SECURITY &bull; PASSWORD RESET</p>
        </div>

        <div style="background-color: #FFFFFF; border-radius: 10px; padding: 32px 28px; box-shadow: 0 4px 16px rgba(0,0,0,0.04); border: 1px solid #EFEAE3;">
            <p style="font-size: 15px; margin-top: 0; color: #292522;">Hello <strong>{name_display}</strong>,</p>
            <p style="font-size: 14px; line-height: 1.6; color: #555555; margin-bottom: 20px;">
                We received a request to reset the password associated with your account. Use the following 6-digit code to complete the process:
            </p>

            <div style="text-align: center; margin: 28px 0;">
                <div style="display: inline-block; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #111111; background-color: #F8F5F0; padding: 16px 36px; border-radius: 8px; border: 1.5px solid #B69A70;">
                    {code}
                </div>
                <p style="font-size: 12px; color: #888888; margin-top: 10px;">Expires in 15 minutes</p>
            </div>

            <p style="font-size: 13px; line-height: 1.5; color: #777777; margin-bottom: 0;">
                If you did not request a password reset, please ignore this email or reach out to concierge support.
            </p>
        </div>
    </div>
    """

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=_get_from_email(),
            recipient_list=[clean_recipient],
            html_message=html_message,
            fail_silently=False,
        )
        logger.info(f"Password reset email successfully sent to {clean_recipient}")
        return True, "Email dispatched successfully"
    except Exception as e:
        logger.error(f"Could not send email to {clean_recipient}: {e}", exc_info=True)
        return False, str(e)
