from django.urls import path
from dashboard.views import DashboardStatsView,ReportDownloadView

urlpatterns = [
    path('stats/',DashboardStatsView.as_view(),name='stats'),
    path('download-report/',ReportDownloadView.as_view(),name='download-report'),
]
