import pika, os, json, time, sys
from handlers import handle_order_created, handle_order_status_changed

RABBITMQ_HOST  = os.environ.get('RABBITMQ_HOST', 'rabbitmq')
RABBITMQ_USER  = os.environ.get('RABBITMQ_USER', 'guest')
RABBITMQ_PASS  = os.environ.get('RABBITMQ_PASS', 'guest')
ORDER_EXCHANGE = 'orders'
QUEUE_NAME     = 'worker.orders'
RETRY_DELAY    = 5
MAX_RETRIES    = 10


def callback(ch, method, properties, body):
    try:
        data       = json.loads(body)
        event_type = data.get('event_type', 'order.created')
        print(f"[Worker] 📥 {event_type} — order #{data.get('order_id')}")

        if event_type == 'order.created':
            handle_order_created(data)
        elif event_type == 'order.status_changed':
            handle_order_status_changed(data)
        else:
            print(f"[Worker] ⚠️  Unknown event: {event_type}")

        ch.basic_ack(delivery_tag=method.delivery_tag)
        print("[Worker] ✅ Acknowledged")

    except json.JSONDecodeError:
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
    except Exception as e:
        print(f"[Worker] ❌ Error: {e}")
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)


def connect_with_retry():
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            print(f"[Worker] 🔌 Connecting ({attempt}/{MAX_RETRIES})...")
            credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
            connection  = pika.BlockingConnection(
                pika.ConnectionParameters(
                    host        = RABBITMQ_HOST,
                    credentials = credentials,
                    heartbeat   = 600,
                    blocked_connection_timeout = 300,
                )
            )
            print("[Worker] ✅ Connected!")
            return connection
        except pika.exceptions.AMQPConnectionError:
            print(f"[Worker] ⏳ Retrying in {RETRY_DELAY}s...")
            time.sleep(RETRY_DELAY)
    sys.exit(1)


def main():
    print("[Worker] 🌸 FleurShop Worker starting...")
    connection = connect_with_retry()
    channel    = connection.channel()

    # Declare fan-out exchange
    channel.exchange_declare(
        exchange      = ORDER_EXCHANGE,
        exchange_type = 'fanout',
        durable       = True,
    )

    # Declare worker's own queue and bind it to the exchange
    channel.queue_declare(queue=QUEUE_NAME, durable=True)
    channel.queue_bind(queue=QUEUE_NAME, exchange=ORDER_EXCHANGE)

    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=QUEUE_NAME, on_message_callback=callback)

    print(f"[Worker] 👂 Listening on '{QUEUE_NAME}' bound to '{ORDER_EXCHANGE}'...")
    try:
        channel.start_consuming()
    except KeyboardInterrupt:
        channel.stop_consuming()
        connection.close()
        print("[Worker] Goodbye! 🌸")


if __name__ == '__main__':
    main()