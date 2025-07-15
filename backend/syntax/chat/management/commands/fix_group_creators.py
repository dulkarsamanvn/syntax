

from django.core.management.base import BaseCommand
from chat.models import ChatRoom, Membership, Group

class Command(BaseCommand):
    help = 'Fix existing groups to make creators admin'

    def handle(self, *args, **options):
        # Get all group chatrooms
        group_chatrooms = ChatRoom.objects.filter(is_group=True, group__isnull=False)
        
        fixed_count = 0
        
        for chatroom in group_chatrooms:
            try:
                # Get the group creator
                creator = chatroom.group.creator
                
                # Find or create membership for the creator
                membership, created = Membership.objects.get_or_create(
                    user=creator,
                    chatroom=chatroom,
                    defaults={'is_admin': True}
                )
                
                # If membership exists but is not admin, make them admin
                if not created and not membership.is_admin:
                    membership.is_admin = True
                    membership.save()
                    fixed_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'Fixed: Made {creator.username} admin of "{chatroom.group.name}"'
                        )
                    )
                elif created:
                    fixed_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'Created: Made {creator.username} admin of "{chatroom.group.name}"'
                        )
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING(
                            f'Skipped: {creator.username} is already admin of "{chatroom.group.name}"'
                        )
                    )
                    
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(
                        f'Error fixing group {chatroom.id}: {str(e)}'
                    )
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully fixed {fixed_count} groups')
        )

