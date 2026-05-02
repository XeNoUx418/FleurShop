import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email_templates import (
    order_confirmed_template,
    order_preparing_template,
    order_delivered_template,
    order_cancelled_template,
)

EMAIL_HOST    = os.environ.get('EMAIL_HOST',    'smtp.gmail.com')
EMAIL_PORT    = int(os.environ.get('EMAIL_PORT', 587))
EMAIL_ADDRESS = os.environ.get('EMAIL_ADDRESS', '')
EMAIL_PASSWORD= os.environ.get('EMAIL_PASSWORD','')
EMAIL_FROM    = os.environ.get('EMAIL_FROM',    EMAIL_ADDRESS)


def send_email(to: str, subject: str, html_body: str):
    """
    Sends an HTML email via Gmail SMTP.
    Uses TLS (port 587) — never sends passwords in plain text.
    """
    if not EMAIL_ADDRESS or not EMAIL_PASSWORD:
        print("[Email] ⚠️  No credentials configured — skipping email")
        return

    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From']    = EMAIL_FROM
    msg['To']      = to

    # Attach HTML part
    msg.attach(MIMEText(html_body, 'html'))

    try:
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.ehlo()
            server.starttls()          # Encrypt the connection
            server.ehlo()
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.sendmail(EMAIL_ADDRESS, to, msg.as_string())
        print(f"[Email] ✅ Sent to {to} — Subject: {subject}")
    except smtplib.SMTPAuthenticationError:
        print("[Email] ❌ Authentication failed — check EMAIL_ADDRESS and EMAIL_PASSWORD")
    except smtplib.SMTPException as e:
        print(f"[Email] ❌ SMTP error: {e}")
    except Exception as e:
        print(f"[Email] ❌ Unexpected error: {e}")


def send_order_confirmed(email: str, customer_name: str,
                         order_id: int, total: str, items: list):
    html = order_confirmed_template(order_id, customer_name, total, items)
    send_email(
        to      = email,
        subject = f"🌸 Order #{order_id} Confirmed — FleurShop",
        html_body = html,
    )


def send_order_preparing(email: str, customer_name: str,
                         order_id: int, total: str):
    html = order_preparing_template(order_id, customer_name, total)
    send_email(
        to      = email,
        subject = f"🌿 Your order #{order_id} is being prepared — FleurShop",
        html_body = html,
    )


def send_order_delivered(email: str, customer_name: str,
                         order_id: int, total: str):
    html = order_delivered_template(order_id, customer_name, total)
    send_email(
        to      = email,
        subject = f"🎊 Your order #{order_id} has been delivered — FleurShop",
        html_body = html,
    )


def send_order_cancelled(email: str, customer_name: str,
                         order_id: int, total: str):
    html = order_cancelled_template(order_id, customer_name, total)
    send_email(
        to      = email,
        subject = f"❌ Order #{order_id} has been cancelled — FleurShop",
        html_body = html,
    )