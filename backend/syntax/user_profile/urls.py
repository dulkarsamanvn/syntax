from django.urls import path
from user_profile.views import UserProfileView

urlpatterns = [
   path('',UserProfileView.as_view(),name='profile-view'),
]
