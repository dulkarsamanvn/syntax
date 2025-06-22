from rest_framework import serializers
from accounts.models import User

class SignupSerializer(serializers.ModelSerializer):
    password=serializers.CharField(write_only=True,min_length=8)

    class Meta:
        model=User
        fields=['email','username','password']

    def create(self,validated_data):
        return User.objects.create_user(**validated_data)


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields=['username','email','id','is_active']