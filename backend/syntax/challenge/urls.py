from django.urls import path
from challenge.views import ChallengeCreateView,ChallengeListView,ChallengeBlockView

urlpatterns = [
    path('create/',ChallengeCreateView.as_view(),name='create_challenge'),
    path('list/',ChallengeListView.as_view(),name='challenge_list'),
    path('<int:id>/block/',ChallengeBlockView.as_view(),name='block-challenge'),

]
