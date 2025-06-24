from django.db import models

# Create your models here.
class Level(models.Model):
    number=models.PositiveIntegerField(unique=True)
    xp_threshold=models.PositiveIntegerField()

    def __str__(self):
        return f"Level {self.number}"