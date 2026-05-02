import json
from datetime import datetime

from email_sender import (
    send_order_confirmed,
    send_order_preparing,
    send_order_delivered,
    send_order_cancelled,
)


def handle_order_created(data: dict):
    """Triggered when a new order is placed."""
    order_id      = data.get('order_id')
    email         = data.get('email')
    total         = data.get('total', '0')
    customer_name = data.get('customer_name', 'Customer')
    items         = data.get('items', [])

    print(f"[Worker] 📧 Sending order confirmation to {email}")
    send_order_confirmed(email, customer_name, order_id, total, items)


def handle_order_status_changed(data: dict):
    """Triggered when an admin updates the order status."""
    order_id      = data.get('order_id')
    email         = data.get('email')
    total         = data.get('total', '0')
    customer_name = data.get('customer_name', 'Customer')
    new_status    = data.get('status')

    print(f"[Worker] 📧 Sending status update ({new_status}) to {email}")

    if new_status == 'preparing':
        send_order_preparing(email, customer_name, order_id, total)
    elif new_status == 'delivered':
        send_order_delivered(email, customer_name, order_id, total)
    elif new_status == 'cancelled':
        send_order_cancelled(email, customer_name, order_id, total)
    else:
        print(f"[Worker] ℹ️  No email template for status: {new_status}")