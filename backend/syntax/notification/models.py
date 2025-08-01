from django.db import models
from django.conf import settings
# Create your models here.

class Notification(models.Model):
    user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE, related_name="notifications")
    message=models.TextField()
    created_at=models.DateTimeField(auto_now_add=True)
    is_read=models.BooleanField(default=False)
    link=models.URLField(blank=True,null=True)