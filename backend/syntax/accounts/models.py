from django.db import models
from django.contrib.auth.models import BaseUserManager,AbstractBaseUser,PermissionsMixin
from django.utils import timezone
from datetime import timedelta
import random

# Create your models here.
class UserManager(BaseUserManager):
    def create_user(self,username,email,password=None,**extra_fields):
        if not email:
            raise ValueError("Email is Required")
        email=self.normalize_email(email)
        user=self.model(email=email,username=username,**extra_fields)
        user.set_password(password)
        user.save()
        return user
    
    def create_superuser(self,email,username,password=None,**extra_fields):
        extra_fields.setdefault('is_staff',True)
        extra_fields.setdefault('is_superuser',True)
        extra_fields.setdefault('is_verified', True)
        return self.create_user(email,username,password,**extra_fields)
    

class User(AbstractBaseUser,PermissionsMixin):
    email=models.EmailField(unique=True)
    username=models.CharField(max_length=50)
    # avatar = models.ForeignKey("core.Avatar", on_delete=models.SET_NULL, null=True, blank=True)
    # level = models.ForeignKey("core.Level", on_delete=models.SET_NULL, null=True, blank=True)
    xp=models.IntegerField(default=0)
    current_streak=models.IntegerField(default=0)
    longest_streak=models.IntegerField(default=0)
    is_premium=models.BooleanField(default=False)

    is_staff=models.BooleanField(default=False)
    is_superuser=models.BooleanField(default=False)
    is_verified=models.BooleanField(default=False)
    is_active=models.BooleanField(default=True)

    USERNAME_FIELD='email'
    REQUIRED_FIELDS = ['username']

    objects=UserManager()

    def __str__(self):
        return self.email

# -----------------------------------------------------------------


class OTP(models.Model):
    user=models.ForeignKey(User,on_delete=models.CASCADE)
    code=models.CharField(max_length=8)
    created_at=models.DateTimeField(auto_now_add=True)
    expires_at=models.DateTimeField()

    @property
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    @staticmethod
    def generate_code():
        return str(random.randint(100000,999999))