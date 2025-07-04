from django.core.management.base import BaseCommand
from accounts.models import User
from user_profile.models import Level

class Command(BaseCommand):
    help = 'Assign default level to users who have level = None'

    def handle(self, *args, **kwargs):
        default_level = Level.objects.order_by('number').first()
        if not default_level:
            self.stdout.write(self.style.ERROR('No default level found!'))
            return

        users_without_level = User.objects.filter(level__isnull=True)
        count = users_without_level.update(level=default_level)
        self.stdout.write(self.style.SUCCESS(f'✅ Updated {count} users with default level: {default_level}'))
