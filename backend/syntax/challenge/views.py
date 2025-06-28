from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from challenge.serializers import ChallengeSerializer
from rest_framework.response import Response
from rest_framework import status
from challenge.models import Challenge
# Create your views here.

class ChallengeCreateView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request):
        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {'detail': 'You do not have permission to perform this action.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        serializer=ChallengeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Challenge created successfully!"},status=status.HTTP_201_CREATED)
        print("Validation Errors:", serializer.errors)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    
class ChallengeListView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        challenges=Challenge.objects.all().order_by('-created_at')
        serializer=ChallengeSerializer(challenges,many=True)
        return Response(serializer.data)


class ChallengeBlockView(APIView):
    permission_classes=[IsAuthenticated]

    def patch(self,request,id):
        if not(request.user.is_staff or request.user.is_superuser):
            return Response(
                {'detail': 'You do not have permission to perform this action.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        try:
            challenge=Challenge.objects.get(id=id)
        except Challenge.DoesNotExist:
            return Response({'detail':'Challenge not Found'},status=status.HTTP_404_NOT_FOUND)
        
        is_active=request.data.get('is_active')
        if is_active is None:
            return Response({'error':'is_active field is required'},status=status.HTTP_400_BAD_REQUEST)
        challenge.is_active=is_active
        challenge.save()
        return Response({'message':'Challenge Status Updated Successfully'},status=status.HTTP_200_OK)


