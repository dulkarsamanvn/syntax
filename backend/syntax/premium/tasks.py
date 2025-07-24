from celery import shared_task
from django.utils import timezone
from premium.models import SubscriptionHistory,UserSubscription
import datetime


@shared_task
def deactivate_expired_subscriptions():
    print(f"[{datetime.datetime.now()}] Running scheduled task: Deactivate expired subscriptions")
    now=timezone.now()
    expired_subs=UserSubscription.objects.filter(end_date__lt=now, user__is_premium=True)

    for sub in expired_subs:
        user=sub.user
        SubscriptionHistory.objects.create(
            user=user,
            plan=sub.plan,
            start_date=sub.start_date,
            end_date=sub.end_date,
            price=sub.plan.price
        )
        user.is_premium=False
        user.save()
        sub.delete()