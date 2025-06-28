from django.db import models
from django.utils import timezone

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
    