from django.core.management.base import BaseCommand
from django_celery_beat.models import PeriodicTask, CrontabSchedule

class Command(BaseCommand):
    help = 'Setup Celery Beat periodic tasks'

    def handle(self, *args, **options):
        # Create crontab schedule: every day at midnight
        schedule, created = CrontabSchedule.objects.get_or_create(
            minute='0',
            hour='0',
            day_of_week='*',
            day_of_month='*',
            month_of_year='*',
            timezone='UTC',
        )
        
        # Create or update the periodic task
        task, task_created = PeriodicTask.objects.update_or_create(
            name='Deactivate Expired Premiums',
            defaults={
                'task': 'premium.tasks.deactivate_expired_subscriptions',
                'crontab': schedule,
                'enabled': True,
            }
        )
        
        if task_created:
            self.stdout.write(self.style.SUCCESS('Created periodic task: Deactivate Expired Premiums'))
        else:
            self.stdout.write(self.style.SUCCESS('Updated periodic task: Deactivate Expired Premiums'))
            
        # Display current configuration
        self.stdout.write(self.style.SUCCESS(f'Task: {task.task}'))
        self.stdout.write(self.style.SUCCESS(f'Schedule: {schedule}'))
        self.stdout.write(self.style.SUCCESS(f'Enabled: {task.enabled}'))
        self.stdout.write(self.style.SUCCESS('Celery Beat tasks setup completed!'))