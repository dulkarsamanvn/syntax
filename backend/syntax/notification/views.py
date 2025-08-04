from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from notification.models import Notification
from notification.serializers import NotificationSerializer
from rest_framework.response import Response
from rest_framework import status


#view to list all the notification on the user side
#notifications are order by their date
class UserNotificationListView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        notifications=Notification.objects.filter(user=request.user).order_by('-created_at')
        serializer=NotificationSerializer(notifications,many=True)
        return Response(serializer.data)


#view to mark all the notifications as read
class MarkAllNotificationReadView(APIView):
    permission_classes =[IsAuthenticated]

    def post(self,request):
        Notification.objects.filter(user=request.user,is_read=False).update(is_read=True)
        return Response({'message':'All notification marked as read'},status=status.HTTP_200_OK)



# Returns the number of unread notifications for the authenticated user.  
# Filters notifications where `is_read` is False.
class UnreadNotificationCountView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        count=Notification.objects.filter(user=request.user,is_read=False).count()
        return Response({'unread_count':count})