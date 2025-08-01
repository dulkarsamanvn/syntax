from rest_framework import serializers
from challenge.models import Challenge,Submission,Solutions,ChallengeRequest

class ChallengeSerializer(serializers.ModelSerializer):

    start_time=serializers.SerializerMethodField()
    end_time=serializers.SerializerMethodField()
    
    class Meta:
        model=Challenge
        fields='__all__'

    def get_start_time(self,obj):
        return obj.start_time.strftime('%Y-%m-%dT%H:%M') if obj.start_time else None
    
    def get_end_time(self,obj):
        return obj.end_time.strftime('%Y-%m-%dT%H:%M') if obj.end_time else None


class ChallengeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model=Challenge
        fields='__all__'

class SubmissionSerializer(serializers.Serializer):
    challenge_id = serializers.IntegerField()
    code = serializers.CharField()
    language = serializers.CharField()


class SubmissionListSerializer(serializers.ModelSerializer):
    class Meta:
        model=Submission
        fields=[
            "id",
            "language",
            "code",
            "is_completed",
            "passed_test_cases",
            "total_test_cases",
            "runtime",
            "xp_awarded",
            "created_at"
        ]



class SolutionSerializer(serializers.ModelSerializer):
    username=serializers.CharField(source='user.username',read_only=True)
    class Meta:
        model=Solutions
        fields = ['id', 'challenge', 'user', 'username', 'description', 'code', 'language', 'created_at']
        read_only_fields = ['user','challenge']


class ChallengeRequestSerializer(serializers.ModelSerializer):
    username=serializers.CharField(source='user.username',read_only=True)
    class Meta:
        model=ChallengeRequest
        fields='__all__'
        read_only_fields=['user','created_at']