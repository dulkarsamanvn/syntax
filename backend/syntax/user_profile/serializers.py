from rest_framework import serializers
from accounts.models import User
from user_profile.models import Level,UserProfile
from challenge.models import Submission
from django.contrib.auth import authenticate


class UserProfileSerializer(serializers.ModelSerializer):
    rank=serializers.SerializerMethodField(read_only=True)
    level=serializers.SerializerMethodField(read_only=True)
    rank_title=serializers.SerializerMethodField(read_only=True)
    xp_for_next_level = serializers.SerializerMethodField(read_only=True) 
    xp_needed = serializers.SerializerMethodField(read_only=True)
    profile_photo_url = serializers.SerializerMethodField(read_only=True)
    sample_data=serializers.SerializerMethodField(read_only=True)

    class Meta:
        model=User
        fields=['id',
                'username', 'email', 'xp', 'current_streak', 'longest_streak',
                'is_premium', 'profile_photo', 'level', 'rank','rank_title','xp_for_next_level','xp_needed','profile_photo_url']
        read_only_fields = [
            'id',
            'email', 'xp', 'current_streak', 'longest_streak',
            'is_premium', 'level', 'rank',
            'rank_title', 'xp_for_next_level', 'xp_needed','profile_photo_url','sample_data'
        ]
        
    def get_rank(self,obj):
        return obj.get_rank()
    
    def get_level(self,obj):
        return obj.level.number if obj.level else 1
    
    def get_rank_title(self,obj):
        return obj.compute_rank()
    
    def get_xp_for_next_level(self,obj):
        next_level=obj.get_next_level_info()
        return next_level.get('xp_for_next_level')
    
    def get_xp_needed(self,obj):
        next_level=obj.get_next_level_info()
        return next_level.get('xp_needed')
    
    def get_profile_photo_url(self,obj):
        if obj.profile_photo:
            return obj.profile_photo.url
        return None

    def sample_data(self,obj):
        return "sample data"



class LevelSerializer(serializers.ModelSerializer):
    class Meta:
        model=Level
        fields='__all__'



class XpHistorySerializer(serializers.ModelSerializer):
    challenge_title=serializers.CharField(source='challenge.title')
    class Meta:
        model=Submission
        fields=['id','xp_awarded','challenge_title','created_at']


class ChangePasswordSerializer(serializers.Serializer):
    current_password=serializers.CharField(write_only=True)
    new_password=serializers.CharField(write_only=True)

    def validate_current_password(self,value):
        user=self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value


class ProfileDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model=UserProfile
        fields=['tagline','bio','github_url', 'twitter_url', 'discord']
        