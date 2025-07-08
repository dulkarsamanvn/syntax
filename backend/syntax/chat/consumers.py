from channels.generic.websocket import AsyncWebsocketConsumer
import json
from asgiref.sync import sync_to_async
import logging
from chat.models import ChatRoom,Message
from accounts.models import User

logger = logging.getLogger(__name__)

@sync_to_async
def get_old_messages(room_id):
    messages=(
        Message.objects.filter(chatroom_id=room_id).select_related('sender').order_by('timestamp')
    )
    return [
        {
            "message": message.text,
            "sender_id": message.sender.id,
            "timestamp": message.timestamp.isoformat(),
        }
        for message in messages
    ]

class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.room_id=self.scope['url_route']['kwargs']['room_id']
        self.room_group_name=f'chat_{self.room_id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        logger.info(f"WebSocket connected to room {self.room_id}")

        messages=await get_old_messages(self.room_id)

        for message in messages:
            await self.send(text_data=json.dumps(message))
    
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        logger.info(f"WebSocket disconnected from room {self.room_id}")
    
    async def receive(self, text_data):
        try:
            logger.info(f"Received raw data: {text_data}")
            try:
                data=json.loads(text_data)
                logger.info(f"Parsed data: {data}")
            except json.JSONDecodeError as e:
                logger.error(f"Invalid JSON received: {e}")
                await self.send(text_data=json.dumps({
                    'error': 'Invalid JSON format'
                }))
                return
            message=data.get('message')
            sender_id=data.get('sender_id')

            if not message:
                logger.error("Message is missing or empty")
                await self.send(text_data=json.dumps({
                    'error': 'Message is required'
                }))
                return
                
            if not sender_id:
                logger.error("Sender ID is missing")
                await self.send(text_data=json.dumps({
                    'error': 'Sender ID is required'
                }))
                return
            

            try:
                room = await sync_to_async(ChatRoom.objects.get)(id=self.room_id)
            except ChatRoom.DoesNotExist:
                logger.error(f"ChatRoom with id {self.room_id} does not exist")
                await self.send(text_data=json.dumps({
                    'error': 'Chat room not found'
                }))
                return
            
            try:
                sender = await sync_to_async(User.objects.get)(id=sender_id)
            except User.DoesNotExist:
                logger.error(f"User with id {sender_id} does not exist")
                await self.send(text_data=json.dumps({
                    'error': 'Sender not found'
                }))
                return
            
            try:
                recipient = None
                
                message_obj = await sync_to_async(Message.objects.create)(
                    chatroom=room,
                    sender=sender,
                    text=message
                )
                logger.info(f"Message created: {message_obj.id}")
                room.last_message=message_obj
                await sync_to_async(room.save)()
                logger.info(f"Updated last_message for room {room.id}")
                # ---------------------------------------------------------
                await sync_to_async(room.participants.add)(sender)  
                if not room.is_group:
                    other_user = await sync_to_async(lambda: list(room.participants.exclude(id=sender.id)))()
                    if not other_user:
                        recipient = await sync_to_async(lambda: room.participants.first())()
                        if recipient and recipient.id != sender.id:
                            await sync_to_async(room.participants.add)(recipient)
                # ---------------------------------------------------------
                participants = await sync_to_async(lambda: list(room.participants.exclude(id=sender.id)))()
                for user in participants:
                    await self.channel_layer.group_send(
                        f"user_{user.id}",
                        {
                            "type": "new_message",
                            "chatroom_id": room.id,
                            "sender_id": sender.id,
                            "message": message_obj.text,
                            "timestamp": message_obj.timestamp.isoformat(),
                        }
                    )
                    logger.info(f"Sending notification to group user_{user.id}")
                # ---------------------------------------------------------
            except Exception as e:
                logger.error(f"Error creating message: {e}")
                await self.send(text_data=json.dumps({
                    'error': 'Failed to save message'
                }))
                return
            
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "message": message,
                    "sender_id": sender_id,
                    "message_id": message_obj.id,
                    "timestamp": message_obj.created_at.isoformat() if hasattr(message_obj, 'created_at') else None,
                }
            )
        except Exception as e:
            logger.error(f"Unexpected error in receive: {e}")
            await self.send(text_data=json.dumps({
                'error': 'Internal server error'
            }))

     
    
    async def chat_message(self,event):
        try:
            await self.send(text_data=json.dumps({
                "message": event["message"],
                "sender_id": event["sender_id"],
                "message_id": event.get("message_id"),
                "timestamp": event.get("timestamp"),
            }))
        except Exception as e:
            logger.error(f"Error sending message to WebSocket: {e}")
        
        