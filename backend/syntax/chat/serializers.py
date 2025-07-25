from rest_framework import serializers
from accounts.models import User
from chat.models import ChatRoom,Group


class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields=['id','username','profile_photo']
        
class ChatRoomListSerializer(serializers.ModelSerializer):
    other_user=serializers.SerializerMethodField()
    group_name=serializers.SerializerMethodField()
    group_description=serializers.SerializerMethodField()
    is_group=serializers.BooleanField()
    last_message=serializers.SerializerMethodField()
    last_message_time=serializers.SerializerMethodField()
    unread_count=serializers.SerializerMethodField()

    class Meta:
        model=ChatRoom
        fields=['id','other_user','is_group','group_name','group_description','last_message','last_message_time','unread_count']

    
    def get_other_user(self,obj):
        request_user=self.context['request'].user
        others=obj.participants.exclude(id=request_user.id)
        if others.exists():
            return UserMiniSerializer(others.first()).data
        return None
    
    def get_group_name(self,obj):
        return obj.group.name if obj.is_group and obj.group else None
    
    def get_group_description(self,obj):
        return obj.group.description if obj.is_group and obj.group else None
    
    def get_last_message(self,obj):
        if not obj.last_message:
            return None
        
        if obj.last_message.attachment:
            if obj.last_message.text:
                return f"Photo: {obj.last_message.text}"
            else:
                return "Photo"
        return obj.last_message.text
    
    def get_last_message_time(self,obj):
        return obj.last_message.timestamp if obj.last_message else None
    
    def get_unread_count(self,obj):
        user=self.context['request'].user
        return obj.messages.filter(is_read=False).exclude(sender=user).count()
    


class GroupSerializer(serializers.ModelSerializer):
    member_count=serializers.SerializerMethodField()
    chatroom_id=serializers.SerializerMethodField()
    class Meta:
        model=Group
        fields=["id", "name", "description", "is_private", "member_limit", "creator", "created_at","is_active",'member_count','chatroom_id']

    def get_member_count(self,obj):
        return obj.member_count()
    
    def get_chatroom_id(self,obj):
        return obj.chatroom.id if hasattr(obj, 'chatroom') else None


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields=['id','username','email']