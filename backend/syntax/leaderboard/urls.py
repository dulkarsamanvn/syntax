from django.urls import path
from leaderboard.views import LeaderBoardView,CreateReportUserView,UserReportListView,ReportStatusUpdateView

urlpatterns = [
   path('',LeaderBoardView.as_view(),name='leaderboard'),
   path('report-user/',CreateReportUserView.as_view(),name='report-user'),
   path('report-list/',UserReportListView.as_view(),name='report-list'),
   path('report-status-update/<int:id>/',ReportStatusUpdateView.as_view(),name='report-status-update'),
]
