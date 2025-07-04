from django.urls import path
from leaderboard.views import LeaderBoardView

urlpatterns = [
   path('',LeaderBoardView.as_view(),name='leaderboard')
]
