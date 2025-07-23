from django.dispatch import receiver
from django.db.models.signals import post_save
from chat.models import Group,ChatRoom

@receiver(post_save,sender=Group)
def sync_group_active_to_chatroom(sender,instance,**kwargs):
    if hasattr(instance,'chatroom'):
        instance.chatroom.is_active=instance.is_active
        instance.chatroom.save()