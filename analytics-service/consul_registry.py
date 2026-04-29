import consul
import os


def register_service(name: str, port: int, service_id: str = None):
    try:
        consul_host = os.environ.get('CONSUL_HOST', 'localhost')
        consul_port = int(os.environ.get('CONSUL_PORT', 8500))
        service_ip  = os.environ.get('SERVICE_IP', '127.0.0.1')

        client     = consul.Consul(host=consul_host, port=consul_port)
        service_id = service_id or f"{name}-{port}"

        client.agent.service.register(
            name       = name,
            service_id = service_id,
            address    = service_ip,
            port       = port,
            tags       = ['django', 'microservice', name],
            check      = consul.Check.http(
                url      = f"http://{service_ip}:{port}/health/",
                interval = "10s",
                timeout  = "5s",
            )
        )
        print(f"[Consul] ✅ Registered '{name}' at {service_ip}:{port}")

    except Exception as e:
        print(f"[Consul] ⚠️  Could not register: {e}")