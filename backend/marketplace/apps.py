from django.apps import AppConfig

def ready(self):
    import backend.signals

class MarketplaceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'marketplace'
