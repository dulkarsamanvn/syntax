"""
ASGI config for syntax project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os
import django
# from channels.auth import AuthMiddlewareStack
from channels.routing import URLRouter,ProtocolTypeRouter
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'syntax.settings')
django.setup()
from chat.middleware import JWTAuthFromCookieMiddlewareStack
import chat.routing


application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": JWTAuthFromCookieMiddlewareStack(
        URLRouter(
            chat.routing.websocket_urlpatterns
        )
    ),
})
