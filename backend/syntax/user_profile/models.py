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


class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    tagline=models.CharField(max_length=140,blank=True,default='')
    bio=models.TextField(blank=True, default='')
    github_url = models.URLField(blank=True, default='')
    twitter_url = models.URLField(blank=True, default='')
    discord = models.CharField(max_length=100, blank=True, default='')

    def __str__(self):
        return f"{self.user.username}'s profile"