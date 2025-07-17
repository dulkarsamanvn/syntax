from django.db import models
from django.utils import timezone
from django.conf import settings

# Create your models here.
class Challenge(models.Model):

    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    LANGUAGE_CHOICES = [
        ("python", "Python"),
        ("javascript", "JavaScript"),
        ("cpp", "C++"),
        ("java", "Java"),
        ("c", "C"),
    ]

    title=models.CharField(max_length=255)
    description=models.TextField()
    instructions=models.TextField()
    difficulty=models.CharField(max_length=20,choices=DIFFICULTY_CHOICES)
    test_cases=models.JSONField(default=list)
    time_limit=models.IntegerField(default=2)
    tags=models.JSONField(default=list)
    hints=models.JSONField(default=list)
    required_skills=models.JSONField(default=list)
    is_premium=models.BooleanField(default=False)
    function_signature = models.TextField(blank=True, null=True)
    languages = models.JSONField(default=list)
    initial_code=models.JSONField(default=dict)
    solution_code=models.JSONField(default=dict)
    is_active = models.BooleanField(default=True)
    start_time=models.DateTimeField(null=True,blank=True)
    end_time=models.DateTimeField(null=True,blank=True)
    xp_reward=models.IntegerField()
    created_at=models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.title
    

class Submission(models.Model):
    user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE)
    challenge=models.ForeignKey(Challenge,on_delete=models.CASCADE)
    code=models.TextField()
    language=models.CharField(max_length=30)
    is_completed=models.BooleanField(default=False)
    passed_test_cases=models.PositiveIntegerField(default=0)
    total_test_cases=models.PositiveIntegerField(default=0)
    runtime=models.FloatField(null=True, blank=True, help_text="Time taken in seconds")
    xp_awarded = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering=['-created_at']


class Solutions(models.Model):
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE, related_name='solutions')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    description = models.TextField()
    code = models.TextField()
    language = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s solution to {self.challenge.title}"