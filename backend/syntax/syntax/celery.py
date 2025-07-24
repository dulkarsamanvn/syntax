import os
from celery import Celery
from celery.schedules import crontab 

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'syntax.settings')

app = Celery('syntax')

# Load task modules from all registered Django app configs.
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# app.conf.beat_schedule = {
#     'deactivate-expired-premiums': {
#         'task': 'premium.tasks.deactivate_expired_subscriptions',
#         'schedule': crontab(hour=0, minute=0),  # Daily at midnight
#     },
# }