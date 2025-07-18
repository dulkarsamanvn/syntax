from channels.generic.websocket import AsyncWebsocketConsumer
import json
from asgiref.sync import sync_to_async
import logging
from chat.models import ChatRoom,Message
from accounts.models import User
from channels.db import database_sync_to_async


logger = logging.getLogger(__name__)

@sync_to_async
def get_old_messages(room_id):
    messages=(
        Message.objects.filter(chatroom_id=room_id).select_related('sender').order_by('timestamp')
    )
    return [
        {
            "message": message.text,
            "message_id": message.id,
            "sender_id": message.sender.id,
            "timestamp": message.timestamp.isoformat(),
        }
        for message in messages
    ]

@sync_to_async
def delete_message_by_id(message_id,sender_id):
    try:
        msg=Message.objects.get(id=message_id, sender_id=sender_id)
        msg.delete()
        return True
    except Message.DoesNotExist:
        return False

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
                # -------------
                logger.info(f"Parsed data: {data}")
            except json.JSONDecodeError as e:
                logger.error(f"Invalid JSON received: {e}")
                await self.send(text_data=json.dumps({
                    'error': 'Invalid JSON format'
                }))
                return
            message=data.get('message')
            sender_id=data.get('sender_id')
            typing=data.get('typing')
            delete_id=data.get('delete_id')
            msg_type=data.get('type')
            
            if msg_type=='mark_read':
                await self.mark_messages_as_read(data)
                return

            if delete_id:
                if not sender_id:
                    await self.send(text_data=json.dumps({'error': 'Sender ID is required for deletion'}))
                    return
                await self.handle_delete(delete_id, sender_id)
                return

            if typing is not None and sender_id:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'typing_event',
                        'sender_id': sender_id,
                        'is_typing': typing,
                    }
                )
                return

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
                    "timestamp": message_obj.timestamp.isoformat(),
                    # "timestamp": message_obj.created_at.isoformat() if hasattr(message_obj, 'created_at') else None,
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
    
    async def typing_event(self,event):
        logger.info(f"Typing event: {event}")
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'sender_id': event['sender_id'],
            'is_typing': event['is_typing'],
        }))


    async def handle_delete(self,message_id,sender_id):
        success=await delete_message_by_id(message_id,sender_id)
        if success:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'delete_message_event',
                    'message_id': message_id,
                }
            )
        else:
            await self.send(text_data=json.dumps({'error': 'Message not found or not authorized to delete'}))
    
    async def delete_message_event(self,event):
        await self.send(text_data=json.dumps({
            'type': 'delete',
            'message_id': event['message_id'],
        }))
    
    async def mark_messages_as_read(self,data):
        user=self.scope['user']
        chatroom_id=data.get('chatroom_id')

        if not user.is_authenticated:
            await self.send(text_data=json.dumps({'error': 'Authentication required'}))
            return
        try:
            room=await sync_to_async(ChatRoom.objects.get)(id=chatroom_id)
        except ChatRoom.DoesNotExist:
            await self.send(text_data=json.dumps({'error': 'Chat room not found'}))
            return
        count = await database_sync_to_async(
            lambda: Message.objects.filter(
                chatroom=room, is_read=False
            ).exclude(sender=user).update(is_read=True)
        )()

        await self.send(text_data=json.dumps({
            'type': 'mark_read_ack',
            'marked_read': count
        }))

        
        