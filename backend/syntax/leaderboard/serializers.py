from rest_framework import serializers
from accounts.models import User
from leaderboard.models import UserReport

class LeaderboardSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields='__all__'

class ReportSerializer(serializers.ModelSerializer):
    reported_by=serializers.SerializerMethodField()
    reported_user=serializers.SerializerMethodField()

    class Meta:
        model=UserReport
        fields='__all__'

    def get_reported_by(self,obj):
        return {'id':obj.reported_by.id,'username':obj.reported_by.username}

    def get_reported_user(self,obj):
        return {'id':obj.reported_user.id,'username':obj.reported_user.username}