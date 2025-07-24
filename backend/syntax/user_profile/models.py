from django.db import models
from django.conf import settings
# Create your models here.
class Level(models.Model):
    number=models.PositiveIntegerField(unique=True)
    xp_threshold=models.PositiveIntegerField()

    def __str__(self):
        return f"Level {self.number}"


class DailyXPClaim(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='xp_claims')
    day = models.PositiveIntegerField()
    xp_awarded = models.PositiveIntegerField(null=True, blank=True)
    claimed_at = models.DateField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'claimed_at']
