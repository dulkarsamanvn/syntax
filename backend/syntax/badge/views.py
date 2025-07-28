from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from badge.serializers import BadgeSerializer
from badge.models import Badge,UserBadge
# Create your views here.

class BadgeCreateView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request):
        if not (request.user.is_superuser or request.user.is_staff):
            return Response(
                {'detail':'You do not have permission to perform this action.'},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer=BadgeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data,status=status.HTTP_201_CREATED)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

class BadgeUpdateView(APIView):
    permission_classes=[IsAuthenticated]

    def patch(self,request,badge_id):
        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {'detail': 'You do not have permission to perform this action.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        badge=Badge.objects.get(id=badge_id)
        serializer=BadgeSerializer(badge,data=request.data,partial=True)
        if serializer.is_valid():
            serializer.save()

            return Response({'message':'Badge updated Successfully'},status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    
class BadgeListView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        badges=Badge.objects.all().order_by('-created_at')
        serializer=BadgeSerializer(badges,many=True)
        return Response(serializer.data)


class BadgeBlockView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request,badge_id):
        badge=Badge.objects.get(id=badge_id)
        is_active=request.data.get('is_active')
        badge.is_active=is_active
        badge.save()
        return Response({'message':'Badge Status updated successfully'},status=status.HTTP_200_OK)
    

class UserEarnedBadgesView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        earned=UserBadge.objects.filter(user=request.user).select_related('badge')
        badges=[ub.badge for ub in earned]
        serializer=BadgeSerializer(badges,many=True)
        return Response(serializer.data)