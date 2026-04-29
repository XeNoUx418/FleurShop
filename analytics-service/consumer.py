import pika
import json
import os
import time
import sys
import django

# Bootstrap Django so we can use ORM from outside a request context
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'analytics_service.settings')
django.setup()

from django.utils import timezone
from analytics.models import (
    DailyRevenue, ProductStat, HourlyStat,
    OrderStatusStat, RecentEvent
)

RABBITMQ_HOST  = os.environ.get('RABBITMQ_HOST',  'rabbitmq')
RABBITMQ_USER  = os.environ.get('RABBITMQ_USER',  'guest')
RABBITMQ_PASS  = os.environ.get('RABBITMQ_PASS',  'guest')
ORDER_EXCHANGE = 'orders'
QUEUE_NAME     = 'analytics.orders'
RETRY_DELAY    = 5
MAX_RETRIES    = 10


# ── Event handlers ────────────────────────────────────────────

from decimal import Decimal

def process_order_created(data: dict):
    now      = timezone.now()
    total    = Decimal(str(data.get('total', 0)))   # ← str first, then Decimal
    order_id = data.get('order_id')
    items    = data.get('items', [])

    # 1. Daily revenue
    day, _ = DailyRevenue.objects.get_or_create(date=now.date())
    day.revenue     += total
    day.order_count += 1
    day.save()

    # 2. Product stats
    for item in items:
        name     = item.get('name', 'Unknown')
        qty      = int(item.get('quantity', 1))
        subtotal = Decimal(str(item.get('subtotal', 0)))  # ← Decimal
        pid      = item.get('product_id')

        if not pid:
            continue

        stat, _ = ProductStat.objects.get_or_create(
            product_id = pid,
            defaults   = {'product_name': name}
        )
        stat.product_name  = name
        stat.units_sold   += qty
        stat.revenue      += subtotal
        stat.order_count  += 1
        stat.save()

    # 3. Hourly stat
    hour_stat, _ = HourlyStat.objects.get_or_create(hour=now.hour)
    hour_stat.order_count += 1
    hour_stat.save()

    # 4. Order status count
    status_stat, _ = OrderStatusStat.objects.get_or_create(status='pending')
    status_stat.count += 1
    status_stat.save()

    # 5. Recent event feed
    RecentEvent.objects.create(
        event_type    = 'order.created',
        order_id      = order_id,
        customer_name = data.get('customer_name', ''),
        total         = total,
    )
    old_ids = list(RecentEvent.objects.values_list('id', flat=True)[100:])
    if old_ids:
        RecentEvent.objects.filter(id__in=old_ids).delete()

    print(f"[Analytics] ✅ Order #{order_id} recorded — "
          f"{total} DZD, {len(items)} items")


def process_status_changed(data: dict):
    new_status = data.get('status', '')
    order_id   = data.get('order_id')

    stat, _ = OrderStatusStat.objects.get_or_create(status=new_status)
    stat.count += 1
    stat.save()

    if new_status != 'pending':
        pending, _ = OrderStatusStat.objects.get_or_create(status='pending')
        pending.count = max(0, pending.count - 1)
        pending.save()

    RecentEvent.objects.create(
        event_type    = 'order.status_changed',
        order_id      = order_id,
        customer_name = data.get('customer_name', ''),
        total         = Decimal(str(data.get('total', 0))),  # ← Decimal
        status        = new_status,
    )
    old_ids = list(RecentEvent.objects.values_list('id', flat=True)[100:])
    if old_ids:
        RecentEvent.objects.filter(id__in=old_ids).delete()

    print(f"[Analytics] ✅ Order #{order_id} status → {new_status}")


# ── RabbitMQ consumer ─────────────────────────────────────────

def callback(ch, method, properties, body):
    try:
        data       = json.loads(body)
        event_type = data.get('event_type', 'order.created')

        print(f"[Analytics] 📥 {event_type} — order #{data.get('order_id')}")

        if event_type == 'order.created':
            process_order_created(data)
        elif event_type == 'order.status_changed':
            process_status_changed(data)

        ch.basic_ack(delivery_tag=method.delivery_tag)

    except Exception as e:
        print(f"[Analytics] ❌ Error: {e}")
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)


def connect_with_retry():
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            print(f"[Analytics] 🔌 Connecting ({attempt}/{MAX_RETRIES})...")
            credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
            connection  = pika.BlockingConnection(
                pika.ConnectionParameters(
                    host        = RABBITMQ_HOST,
                    credentials = credentials,
                    heartbeat   = 600,
                    blocked_connection_timeout = 300,
                )
            )
            print("[Analytics] ✅ Connected!")
            return connection
        except pika.exceptions.AMQPConnectionError:
            print(f"[Analytics] ⏳ Retrying in {RETRY_DELAY}s...")
            time.sleep(RETRY_DELAY)
    sys.exit(1)


def main():
    print("[Analytics] 🌸 FleurShop Analytics Service starting...")
    connection = connect_with_retry()
    channel    = connection.channel()

    # Declare fan-out exchange (must match api-service declaration)
    channel.exchange_declare(
        exchange      = ORDER_EXCHANGE,
        exchange_type = 'fanout',
        durable       = True,
    )

    # Declare analytics' own private queue and bind to exchange
    channel.queue_declare(queue=QUEUE_NAME, durable=True)
    channel.queue_bind(queue=QUEUE_NAME, exchange=ORDER_EXCHANGE)

    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=QUEUE_NAME, on_message_callback=callback)

    print(f"[Analytics] 👂 Listening on '{QUEUE_NAME}' "
          f"bound to '{ORDER_EXCHANGE}' exchange...")
    try:
        channel.start_consuming()
    except KeyboardInterrupt:
        channel.stop_consuming()
        connection.close()


if __name__ == '__main__':
    main()