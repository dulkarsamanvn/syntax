from django.urls import re_path
from notification.consumers import SystemNotificationConsumer

websocket_urlpatterns =[
    re_path(r"ws/system-notifications/$",SystemNotificationConsumer.as_asgi())
]