import pika
import json
import time
import sys
import os
from email_sender import send_low_stock_alert

RABBITMQ_HOST  = os.environ.get('RABBITMQ_HOST',  'rabbitmq')
RABBITMQ_USER  = os.environ.get('RABBITMQ_USER',  'guest')
RABBITMQ_PASS  = os.environ.get('RABBITMQ_PASS',  'guest')
QUEUE_NAME     = 'inventory.low'
RETRY_DELAY    = 5
MAX_RETRIES    = 10


def callback(ch, method, properties, body):
    try:
        data = json.loads(body)
        print(f"[Alert] 📥 Low stock event received: "
              f"'{data.get('product_name')}' "
              f"(stock: {data.get('current_stock')})", flush=True)

        send_low_stock_alert(
            product_name  = data.get('product_name', 'Unknown'),
            product_id    = data.get('product_id'),
            current_stock = data.get('current_stock', 0),
            threshold     = data.get('threshold', 5),
            order_id      = data.get('order_id'),
        )

        ch.basic_ack(delivery_tag=method.delivery_tag)
        print(f"[Alert] ✅ Event processed and acknowledged", flush=True)

    except json.JSONDecodeError:
        print(f"[Alert] ❌ Invalid JSON: {body}")
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False, flush=True)
    except Exception as e:
        print(f"[Alert] ❌ Error: {e}")
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True, flush=True)


def connect_with_retry():
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            print(f"[Alert] 🔌 Connecting to RabbitMQ "
                  f"(attempt {attempt}/{MAX_RETRIES})...")
            credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
            connection  = pika.BlockingConnection(
                pika.ConnectionParameters(
                    host        = RABBITMQ_HOST,
                    credentials = credentials,
                    heartbeat   = 600,
                    blocked_connection_timeout = 300,
                )
            )
            print("[Alert] ✅ Connected to RabbitMQ!", flush=True)
            return connection
        except pika.exceptions.AMQPConnectionError:
            print(f"[Alert] ⏳ Retrying in {RETRY_DELAY}s...", flush=True)
            time.sleep(RETRY_DELAY)

    print("[Alert] ❌ Could not connect. Exiting.", flush=True)
    sys.exit(1)


def main():
    print("[Alert] 🌸 FleurShop Inventory Alert Service starting...", flush=True)

    connection = connect_with_retry()
    channel    = connection.channel()

    # Declare the inventory queue — completely separate from order.created
    channel.queue_declare(queue=QUEUE_NAME, durable=True)
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=QUEUE_NAME,
                          on_message_callback=callback)

    print(f"[Alert] 👂 Listening on queue '{QUEUE_NAME}'...", flush=True)
    print("[Alert]    Press CTRL+C to stop\n", flush=True)

    try:
        channel.start_consuming()
    except KeyboardInterrupt:
        channel.stop_consuming()
        connection.close()
        print("[Alert] Goodbye! 🌸", flush=True)


if __name__ == '__main__':
    main()