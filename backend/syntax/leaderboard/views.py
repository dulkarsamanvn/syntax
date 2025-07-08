from django.shortcuts import render
from rest_framework.views import APIView
from accounts.models import User
from rest_framework.response import Response
from leaderboard.serializers import LeaderboardSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q

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
