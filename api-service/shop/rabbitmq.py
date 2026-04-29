import pika
import json
import os

RABBITMQ_HOST       = os.environ.get('RABBITMQ_HOST', 'localhost')
RABBITMQ_USER       = os.environ.get('RABBITMQ_USER', 'guest')
RABBITMQ_PASS       = os.environ.get('RABBITMQ_PASS', 'guest')
LOW_STOCK_THRESHOLD = 5

# Exchange names
ORDER_EXCHANGE    = 'orders'      # fan-out — all order events
INVENTORY_QUEUE   = 'inventory.low'


def _get_channel():
    """Returns an open channel with credentials."""
    credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
    connection  = pika.BlockingConnection(
        pika.ConnectionParameters(
            host        = RABBITMQ_HOST,
            credentials = credentials,
        )
    )
    channel = connection.channel()
    return connection, channel

def _publish_to_exchange(exchange: str, data: dict):
    """Publishes to a fan-out exchange — all bound queues receive it."""
    try:
        connection, channel = _get_channel()
        channel.exchange_declare(
            exchange      = exchange,
            exchange_type = 'fanout',
            durable       = True,
        )
        channel.basic_publish(
            exchange    = exchange,
            routing_key = '',           # ignored in fanout
            body        = json.dumps(data),
            properties  = pika.BasicProperties(delivery_mode=2)
        )
        connection.close()
        print(f"[RabbitMQ] 📤 Published to exchange '{exchange}': "
              f"{data.get('event_type')}")
    except Exception as e:
        print(f"[RabbitMQ] ⚠️  Publish failed: {e}")


def _publish_to_queue(queue: str, data: dict):
    """Publishes directly to a named queue (for inventory alerts)."""
    try:
        connection, channel = _get_channel()
        channel.queue_declare(queue=queue, durable=True)
        channel.basic_publish(
            exchange    = '',
            routing_key = queue,
            body        = json.dumps(data),
            properties  = pika.BasicProperties(delivery_mode=2)
        )
        connection.close()
        print(f"[RabbitMQ] 📤 Published to queue '{queue}'")
    except Exception as e:
        print(f"[RabbitMQ] ⚠️  Publish failed: {e}")


def publish_order_event(order_id, customer_email, total,
                        customer_name='', items=None):
    _publish_to_exchange(ORDER_EXCHANGE, {
        'event_type':    'order.created',
        'order_id':      order_id,
        'email':         customer_email,
        'total':         total,
        'customer_name': customer_name,
        'items':         items or [],
    })


def publish_status_event(order_id, customer_email, total,
                         status, customer_name=''):
    _publish_to_exchange(ORDER_EXCHANGE, {
        'event_type':    'order.status_changed',
        'order_id':      order_id,
        'email':         customer_email,
        'total':         total,
        'status':        status,
        'customer_name': customer_name,
    })

def publish_inventory_alert(product_id, product_name,
                             current_stock, order_id):
    _publish_to_queue(INVENTORY_QUEUE, {
        'product_id':    product_id,
        'product_name':  product_name,
        'current_stock': current_stock,
        'threshold':     LOW_STOCK_THRESHOLD,
        'order_id':      order_id,
    })
    

"""
def _publish(queue: str, data: dict):
    #Shared helper — publishes to any named queue.
    try:
        credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
        connection  = pika.BlockingConnection(
            pika.ConnectionParameters(
                host        = RABBITMQ_HOST,
                credentials = credentials,
            )
        )
        channel = connection.channel()
        channel.queue_declare(queue=queue, durable=True)  # ← uses the queue param
        channel.basic_publish(
            exchange    = '',
            routing_key = queue,                          # ← routes to correct queue
            body        = json.dumps(data),
            properties  = pika.BasicProperties(delivery_mode=2)
        )
        connection.close()
        print(f"[RabbitMQ] 📤 Published to '{queue}': "
              f"{data.get('event_type', queue)}", flush=True)
    except Exception as e:
        print(f"[RabbitMQ] ⚠️  Publish failed: {e}", flush=True)


def publish_order_event(order_id, customer_email, total,
                        customer_name='', items=None):
    _publish('order.created', {
        'event_type':    'order.created',
        'order_id':      order_id,
        'email':         customer_email,
        'total':         total,
        'customer_name': customer_name,
        'items':         items or [],
    })


def publish_status_event(order_id, customer_email, total,
                         status, customer_name=''):
    _publish('order.created', {
        'event_type':    'order.status_changed',
        'order_id':      order_id,
        'email':         customer_email,
        'total':         total,
        'status':        status,
        'customer_name': customer_name,
    })


def publish_inventory_alert(product_id, product_name,
                             current_stock, order_id):
    _publish('inventory.low', {     # ← now correctly routes to inventory.low
        'product_id':    product_id,
        'product_name':  product_name,
        'current_stock': current_stock,
        'threshold':     LOW_STOCK_THRESHOLD,
        'order_id':      order_id,
    })
"""



"""
def publish_order_event(order_id: int, customer_email: str, total: str):
    try:
        rabbitmq_host = os.environ.get('RABBITMQ_HOST', 'localhost')
        connection    = pika.BlockingConnection(
            pika.ConnectionParameters(host=rabbitmq_host)
        )
        channel = connection.channel()
        channel.queue_declare(queue='order.created', durable=True)
        channel.basic_publish(
            exchange='',
            routing_key='order.created',
            body=json.dumps({
                'order_id': order_id,
                'email':    customer_email,
                'total':    total,
            }),
            properties=pika.BasicProperties(delivery_mode=2)
        )
        connection.close()
        print(f"[API] 📤 Published order #{order_id} to RabbitMQ")
    except Exception as e:
        print(f"[API] ⚠️  RabbitMQ publish failed: {e}")

"""