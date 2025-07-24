from channels.generic.websocket import AsyncWebsocketConsumer
import json

class SystemNotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user=self.scope["user"]
        if not user.is_authenticated:
            await self.close()
        else:
            self.group_name=f"system_notifications_{user.id}"
            await self.channel_layer.group_add(self.group_name,self.channel_name)
            await self.accept()
    
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name,self.channel_name)
    
    async def send_notification(self,event):
        await self.send(text_data=json.dumps(event['data']))