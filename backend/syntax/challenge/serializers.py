from rest_framework import serializers
from challenge.models import Challenge,Submission

class ChallengeSerializer(serializers.ModelSerializer):
    
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
