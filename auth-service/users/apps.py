from django.apps import AppConfig

class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'

    def ready(self):
        """Called automatically when Django starts"""
        # Avoid running during migrations or management commands
        import sys
        if 'runserver' not in sys.argv:
            return

        from consul_registry import register_service
        register_service(
            name = 'auth-service',
            port = 8001,
        )