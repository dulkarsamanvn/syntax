from django.urls import re_path
from chat import consumers,notification_consumer

websocket_urlpatterns = [
    re_path(r"ws/chat/(?P<room_id>\w+)/$", consumers.ChatConsumer.as_asgi()),
    re_path(r"ws/notifications/$", notification_consumer.NotificationConsumer.as_asgi()),
]