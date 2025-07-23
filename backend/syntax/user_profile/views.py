from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from user_profile.serializers import UserProfileSerializer,LevelSerializer,XpHistorySerializer,ChangePasswordSerializer
from rest_framework.parsers import MultiPartParser,FormParser
from rest_framework import status
from user_profile.models import Level,DailyXPClaim
from challenge.models import Submission
from datetime import date


# View to retrieve and update the authenticated user's profile.
# GET: Returns the user's profile data and triggers a level-up check.
# PATCH: Allows partial update of user profile fields including file uploads (profile picture).
class UserProfileView(APIView):
    permission_classes=[IsAuthenticated]
    parser_classes=[MultiPartParser,FormParser]

    def get(self,request):
        request.user.check_level_up()
        serializer=UserProfileSerializer(request.user)
        return Response(serializer.data)
    
    def patch(self,request):
        serializer=UserProfileSerializer(request.user,data=request.data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'message':'Profile Updated Successfully'})
        return Response(serializer.errors,status=400)


# View to create a new level entry in the system.
# Only accepts requests from authenticated users.
# Used by admins to define XP thresholds and level metadata.
class LevelCreateView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request):
        serializer=LevelSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message':'level created successfully'},status=status.HTTP_201_CREATED)
        print(serializer.errors)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)


# View to list all levels ordered by their number.
# Useful for displaying level progressions in a leaderboard or user profile.
class LevelListView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        levels=Level.objects.all().order_by('number')
        serializer=LevelSerializer(levels,many=True)
        return Response(serializer.data)


# View to update an existing level entry by its ID.
# Ensures the level exists before attempting an update.
# Used in admin-level configurations.
class LevelUpdateView(APIView):
    permission_classes=[IsAuthenticated]

    def put(self,request,id):
        try:
            level=Level.objects.get(id=id)
        except Level.DoesNotExist:
            return Response({'error':'level not found'},status=status.HTTP_404_NOT_FOUND)
        
        serializer=LevelSerializer(level,data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message':'level updated successfully'},status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)


# View to retrieve the XP history of the authenticated user.
# Fetches all submissions that awarded XP, ordered by the most recent.
# Helpful for users to track their XP gains over time.
class XpHistoryView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        submissions=Submission.objects.filter(user=request.user,xp_awarded__gt=0).order_by('-created_at')
        serializer=XpHistorySerializer(submissions,many=True)
        return Response(serializer.data)


# view to update the password
# validated the current password before updating the password
class ChangePasswordView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request):
        serializer=ChangePasswordSerializer(data=request.data,context={'request': request})
        if serializer.is_valid():
            user=request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'detail':'Password Changed Successfully'},status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    

XP_DAY_REWARDS = {
    1: 10,
    2: 10,
    3: 10,
    4: 10,
    5: 10,
    6: 10,
    7: 15, 
}

class GiftStatusView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        today=date.today()
        claimed_today=DailyXPClaim.objects.filter(user=request.user,claimed_at=today).exists()
        total_claims=DailyXPClaim.objects.filter(user=request.user).count()
        current_day=(total_claims % 7) + 1
        xp=XP_DAY_REWARDS.get(current_day,10)
        return Response({
            "claimed_today": claimed_today,
            "day": current_day,
            'xp':xp
        })

class ClaimXpView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request):
        today=date.today()
        if DailyXPClaim.objects.filter(user=request.user,claimed_at=today).exists():
            return Response({'error':'Already claimed today'},status=status.HTTP_400_BAD_REQUEST)
        total_claims=DailyXPClaim.objects.filter(user=request.user).count()
        current_day=(total_claims % 7) +1
        xp=XP_DAY_REWARDS.get(current_day,10)

        DailyXPClaim.objects.create(user=request.user,day=current_day)
        request.user.xp+=xp
        request.user.save()
        return Response({"message": f"{xp} XP claimed for Day {current_day}!", "xp": xp},status=status.HTTP_201_CREATED)