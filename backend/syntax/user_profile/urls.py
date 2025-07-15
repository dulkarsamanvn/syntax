from django.urls import path
from user_profile.views import UserProfileView,LevelCreateView,LevelListView,LevelUpdateView

urlpatterns = [
   path('',UserProfileView.as_view(),name='profile-view'),
   path('create-level/',LevelCreateView.as_view(),name='create-level'),
   path('list-levels/',LevelListView.as_view(),name='list-levels'),
   path('<int:id>/update-level/',LevelUpdateView.as_view(),name='update-levels'),
]
