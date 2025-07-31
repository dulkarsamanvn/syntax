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
from django.core.paginator import Paginator
from notification.utils import send_system_notification

# Custom pagination class for the leaderboard.
# Sets default page size to 10 users per page but allows customization via query params.
# Ensures the response is paginated and avoids overloading large result sets.
class LeaderboardPagination(PageNumberPagination):
    page_size=10
    page_size_query_param='page_size'
    max_page_size=100



# View to retrieve and paginate the global leaderboard.
# - Excludes admin users.
# - Supports search functionality by username.
# - Returns both paginated users and the top 3 globally (for displaying highlights).
# - Also includes the current user's ID for front-end handling (highlighting).
class LeaderBoardView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self,request):
        search_query=request.GET.get('search','').strip()
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


# View for reporting a user (e.g., for abuse, inappropriate content, etc.)
# Accepts the reported user's ID, a reason, and an optional description.
# Saves the report in the database for admin review.
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
        send_system_notification(
                [request.user],
                f"Your report against {reported_user.username} has been submitted successfully."
            )

        return Response({'message':'Report Submitted Successfully'},status=status.HTTP_201_CREATED)


# Admin-only view that retrieves all user reports submitted in the system.
# Sorted by most recent (descending order of creation).
# Used for moderation tools to view reported accounts and reasons.
class UserReportListView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        search=request.GET.get('search','')
        page=int(request.GET.get('page',1))
        page_size=int(request.GET.get('page_size',10))
        reports=UserReport.objects.all().order_by('-created_at')
        if search:
            reports = reports.filter(
                Q(reported_by__username__icontains=search) |
                Q(reported_user__username__icontains=search)
            )
        paginator=Paginator(reports,page_size)
        page_obj=paginator.get_page(page)
        paginated_reports=page_obj.object_list
        total_count=paginator.count
        serializer=ReportSerializer(paginated_reports,many=True)
        return Response({
            'results':serializer.data,
            'count':total_count
        })



# View to update the status of a user report.
# Common use cases: mark as 'Resolved', 'Pending', 'In Review', etc.
# Accepts a report ID and the new status.
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

            send_system_notification(
                [report.reported_by],
                f"Your report status has been updated to {status_value}."
            )
            return Response({"success": "Status updated"})
        return Response({'error':'no status provided'},status=status.HTTP_400_BAD_REQUEST)


# Admin-only leaderboard view that returns the top 10 users based on XP.
# Supports search by username or email within the top users.
# Uses Django’s built-in Paginator for page-wise response.
# Used in admin dashboards
class AdminLeaderboardView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        if not (request.user.is_staff or request.user.is_superuser):
            return Response({'detail': 'You do not have permission to perform this action.'},status=status.HTTP_403_FORBIDDEN)

        search=request.GET.get('search','')
        page=int(request.GET.get('page',1))
        page_size=int(request.GET.get('page_size',10))
        top_10_users=User.objects.exclude(is_staff=True).order_by('-xp')[:10]
        top_users=list(top_10_users)
        if search:
            top_users = [
                user for user in top_users 
                if search.lower() in user.username.lower() or search.lower() in user.email.lower()
            ]
        
        paginator=Paginator(top_users,page_size)
        page_obj=paginator.get_page(page)
        serializer=LeaderboardSerializer(page_obj.object_list,many=True)
        return Response({
            'results': serializer.data,
            'count':paginator.count
        })