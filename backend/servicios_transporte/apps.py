from django.apps import AppConfig


class ServiciosTransporteConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'servicios_transporte'

    def ready(self):
        import servicios_transporte.signals
