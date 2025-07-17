from django.db import models
from django.conf import settings
from django.utils import timezone
# Create your models here.
class PremiumPlan(models.Model):
    name=models.CharField(max_length=100)
    description=models.TextField(blank=True)
    price=models.DecimalField(max_digits=8, decimal_places=2)
    duration_days=models.PositiveIntegerField()
    is_active=models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.duration_days} days - ₹{self.price})"


class UserSubscription(models.Model):
    user=models.OneToOneField(settings.AUTH_USER_MODEL,on_delete=models.CASCADE, related_name='subscription')
    plan=models.ForeignKey(PremiumPlan,on_delete=models.SET_NULL, null=True)
    start_date=models.DateTimeField(auto_now_add=True)
    end_date=models.DateTimeField()
    cancelled=models.BooleanField(default=False)

    def has_expired(self):
        return timezone.now() > self.end_date
    
    def remaining_days(self):
        return max((self.end_date - timezone.now()).days,0)
    
    def __str__(self):
        return f"{self.user.username}'s Subscription to {self.plan.name}"


class SubscriptionHistory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='subscription_history')
    plan = models.ForeignKey(PremiumPlan, on_delete=models.SET_NULL, null=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    price = models.DecimalField(max_digits=8, decimal_places=2)

    def __str__(self):
        return f"{self.user.username}'s {self.plan.name} from {self.start_date.date()} to {self.end_date.date()}"