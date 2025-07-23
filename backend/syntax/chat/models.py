from django.db import models
from accounts.models import User

class Group(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    is_private = models.BooleanField(default=False)
    member_limit = models.PositiveIntegerField(default=10)
    creator = models.ForeignKey(User, related_name='created_groups', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

    def member_count(self):
        if hasattr(self, 'chatroom') and self.chatroom:
            return self.chatroom.memberships.count()
        return 0



class ChatRoom(models.Model):
    is_group = models.BooleanField(default=False)
    group = models.OneToOneField(Group, null=True, blank=True, on_delete=models.CASCADE, related_name="chatroom")
    participants = models.ManyToManyField(User, through='Membership', related_name='chatrooms')
    last_message = models.ForeignKey('Message', null=True, blank=True, on_delete=models.SET_NULL, related_name='+')
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Group Chat: {self.group.name}" if self.is_group else f"1-1 ChatRoom {self.id}"


class Message(models.Model):
    chatroom = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField(blank=True)
    # attachment = models.FileField(upload_to='chat_attachments/', blank=True, null=True)
    attachment = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read=models.BooleanField(default=False)

    def __str__(self):
        content = self.text if self.text else "[Attachment]"
        return f"{self.sender.username}: {content[:20]}"


class Membership(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    chatroom = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name="memberships")
    joined_at = models.DateTimeField(auto_now_add=True)
    is_admin=models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'chatroom')

    def __str__(self):
        return f"{self.user.username} in ChatRoom {self.chatroom.id}"


class Reaction(models.Model):
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='reactions')
    user=models.ForeignKey(User, on_delete=models.CASCADE)
    emoji = models.CharField(max_length=10)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('message', 'user', 'emoji')