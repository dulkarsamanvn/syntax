from django.db import models
from django.conf import settings
from cloudinary.models import CloudinaryField

# Create your models here.
class Badge(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    icon = CloudinaryField('icons', blank=True, null=True)
    is_active=models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class UserBadge(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    awarded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together=('user','badge')