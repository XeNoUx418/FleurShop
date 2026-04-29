from django.apps import AppConfig


class ShopConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'shop'

    def ready(self):
        """Called automatically when Django starts"""
        import sys
        if 'runserver' not in sys.argv:
            return

        from consul_registry import register_service
        register_service(
            name = 'api-service',
            port = 8002,
        )