from rest_framework import serializers
from badge.models import Badge

class BadgeSerializer(serializers.ModelSerializer):
    is_active = serializers.BooleanField(required=False, default=True)
    icon = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model=Badge
        fields='__all__'
    
    def get_icon(self,obj):
        if obj.icon:
            return obj.icon.url
        return None
