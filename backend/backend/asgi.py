import os
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application
import bookings.routing  # Your routing for WebSockets

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "your_project_name.settings")

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            bookings.routing.websocket_urlpatterns
        )
    ),
})
