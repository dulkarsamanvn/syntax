from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from user_profile.serializers import UserProfileSerializer,LevelSerializer,XpHistorySerializer
from rest_framework.parsers import MultiPartParser,FormParser
from rest_framework import status
from user_profile.models import Level
from challenge.models import Submission

# Create your views here.

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



class LevelCreateView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request):
        serializer=LevelSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message':'level created successfully'},status=status.HTTP_201_CREATED)
        print(serializer.errors)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)


class LevelListView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        levels=Level.objects.all().order_by('number')
        serializer=LevelSerializer(levels,many=True)
        return Response(serializer.data)

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



class XpHistoryView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        submissions=Submission.objects.filter(user=request.user,xp_awarded__gt=0).order_by('-created_at')
        serializer=XpHistorySerializer(submissions,many=True)
        return Response(serializer.data)
