from django.urls import re_path
from chat.routing import websocket_urlpatterns as chat_ws
from notification.routing import websocket_urlpatterns as notification_ws

websocket_urlpatterns=chat_ws+notification_ws