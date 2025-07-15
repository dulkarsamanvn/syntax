from django.shortcuts import render
from rest_framework.views import APIView
from accounts.models import User
from rest_framework.response import Response
from leaderboard.serializers import LeaderboardSerializer,ReportSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from rest_framework import status
from leaderboard.models import UserReport

# Create your views here.

class LeaderboardPagination(PageNumberPagination):
    page_size=10
    page_size_query_param='page_size'
    max_page_size=100




class LeaderBoardView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request):
        search_query=request.query_params.get('search','').strip()
        users=User.objects.exclude(is_staff=True)
        if search_query:
            users=users.filter(Q(username__icontains=search_query))
        users=users.order_by('-xp')
        top_users=users[:3]

        top_serializer=LeaderboardSerializer(top_users,many=True)
        paginator=LeaderboardPagination()
        page=paginator.paginate_queryset(users,request)
        serializer=LeaderboardSerializer(page,many=True)
        paginated_response=paginator.get_paginated_response(serializer.data)
        paginated_response.data['top_users']=top_serializer.data
        paginated_response.data['current_user_id']=request.user.id
        return paginated_response



class CreateReportUserView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request):
        reported_user_id=request.data.get('reported_user_id')
        report_reason=request.data.get('reportReason')
        description=request.data.get('description')

        try:
            reported_user=User.objects.get(id=reported_user_id)
        except User.DoesNotExist:
            return Response({'error':'user not found'},status=status.HTTP_404_NOT_FOUND)
        
        UserReport.objects.create(
            reported_by=request.user,
            reported_user=reported_user,
            reason=report_reason,
            description=description
        )

        return Response({'message':'Report Submitted Successfully'},status=status.HTTP_201_CREATED)
        

class UserReportListView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        reports=UserReport.objects.all().order_by('-created_at')
        serializer=ReportSerializer(reports,many=True)
        return Response(serializer.data)


class ReportStatusUpdateView(APIView):
    permission_classes=[IsAuthenticated]

    def patch(self,request,id):
        try:
            report=UserReport.objects.get(id=id)
        except UserReport.DoesNotExist:
            return Response({'error':'report not found'},status=status.HTTP_404_NOT_FOUND)
        
        status_value=request.data.get('status')
        if status_value:
            report.status=status_value
            report.save()
            return Response({"success": "Status updated"})
        return Response({'error':'no status provided'},status=status.HTTP_400_BAD_REQUEST)

