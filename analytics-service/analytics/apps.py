from django.apps import AppConfig


class AnalyticsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'analytics'

    def ready(self):
        import sys
        if 'runserver' not in sys.argv:
            return
        from consul_registry import register_service
        register_service(
            name = 'analytics-service',
            port = 8003,
        )