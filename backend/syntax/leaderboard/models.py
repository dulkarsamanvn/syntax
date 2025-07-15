from django.db import models
from django.conf import settings

# Create your models here.
class UserReport(models.Model):
    REPORT_REASONS = [
        ('spam', 'Spam'),
        ('abuse', 'Abusive Behavior'),
        ('inappropriate', 'Inappropriate Content'),
        ('other', 'Other'),
    ]

    reported_by=models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reports_made')
    reported_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reports_received')
    reason=models.CharField(max_length=50,choices=REPORT_REASONS)
    description=models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('reviewed', 'Reviewed'),
        ('resolved', 'Resolved'),
    ], default='pending')
    created_at=models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report by {self.reported_by} on {self.reported_user} ({self.reason})"