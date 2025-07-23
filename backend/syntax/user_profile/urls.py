from django.urls import path
from user_profile.views import UserProfileView,LevelCreateView,LevelListView,LevelUpdateView,XpHistoryView,ChangePasswordView,GiftStatusView,ClaimXpView

urlpatterns = [
   path('',UserProfileView.as_view(),name='profile-view'),
   path('create-level/',LevelCreateView.as_view(),name='create-level'),
   path('list-levels/',LevelListView.as_view(),name='list-levels'),
   path('<int:id>/update-level/',LevelUpdateView.as_view(),name='update-levels'),
   path('xp-history/',XpHistoryView.as_view(),name='xp-history'),
   path('change-password/',ChangePasswordView.as_view(),name='change-password'),
   path('gift-status/',GiftStatusView.as_view(),name='gift-status'),
   path('claim-reward/',ClaimXpView.as_view(),name='claim-reward'),
]
