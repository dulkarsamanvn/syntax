from badge.models import Badge,UserBadge
from datetime import time
from challenge.models import Submission

def award_badges_on_submission(submission):
    user=submission.user

    if submission.runtime and submission.runtime <=30:
        badge=Badge.objects.filter(title__iexact='Fast Solver',is_active=True).first()
        if badge:
            UserBadge.objects.get_or_create(user=user,badge=badge)
    
    if time(0,0) <=submission.created_at.time() <=time(3,0):
        badge=Badge.objects.filter(title__iexact='Midnight Coder',is_active=True).first()
        if badge:
            UserBadge.objects.get_or_create(user=user,badge=badge)
    
    if submission.is_completed and submission.passed_test_cases==submission.total_test_cases:
        previous_fails = Submission.objects.filter(
            user=user, challenge=submission.challenge,
            is_completed=False, created_at__lt=submission.created_at
        ).exists()
        if previous_fails:
            badge=Badge.objects.filter(title__iexact='Debugging Master',is_active=True).first()
            if badge:
                UserBadge.objects.get_or_create(user=user,badge=badge)


    
