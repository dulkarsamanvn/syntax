from rest_framework import serializers
from premium.models import PremiumPlan

class PremiumPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model=PremiumPlan
        fields='__all__'