from channels.layers import get_channel_layer
from notification.models import Notification
from notification.serializers import NotificationSerializer
from asgiref.sync import async_to_sync

def send_system_notification(users,message,link=None):
    channel_layer=get_channel_layer()

    for user in users:
        notification=Notification.objects.create(user=user,message=message,link=link)
        serializer=NotificationSerializer(notification)
        async_to_sync(channel_layer.group_send)(
            f"system_notifications_{user.id}",
            {
                "type": "send_notification",
                "data": serializer.data
            }
        )


