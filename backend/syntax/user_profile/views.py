from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from user_profile.serializers import UserProfileSerializer
from rest_framework.parsers import MultiPartParser,FormParser

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



