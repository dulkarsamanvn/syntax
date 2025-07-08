from channels.generic.websocket import AsyncWebsocketConsumer
import json

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user=self.scope['user']
        print(f"[NOTIFICATION] Attempting connection for: {self.user} (ID: {getattr(self.user, 'id', None)})")
        
        if self.user.is_anonymous:
            print("[NOTIFICATION] Anonymous user — rejecting")
            await self.close()
            return
        
        self.group_name=f"user_{self.user.id}"
        print(f"[NOTIFICATION] Connecting to group: {self.group_name}")

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()
        print(f"[NOTIFICATION] WebSocket accepted for user {self.user.username}")
    
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )
    
    async def new_group(self,event):
        await self.send(text_data=json.dumps({
            "type": "new_group",
            "chatroom_id": event["chatroom_id"],
            "group_name": event["group_name"],
            "timestamp": event["timestamp"],
        }))
    
    async def new_message(self,event):
        print("[NOTIFICATION] Received new_message event", event)
        await self.send(text_data=json.dumps({
            "type": "new_message",
            "chatroom_id": event["chatroom_id"],
            "sender_id": event["sender_id"],
            "message": event["message"],
            "timestamp": event["timestamp"],
        }))