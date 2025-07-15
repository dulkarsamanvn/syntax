from django.urls import path
from challenge.views import ChallengeCreateView,ChallengeListView,ChallengeBlockView,ChallengeDetailView,RunChallengeView,SubmitChallengeView,SubmissionListView,ChallengeUpdateView

urlpatterns = [
    path('create/',ChallengeCreateView.as_view(),name='create_challenge'),
    path('list/',ChallengeListView.as_view(),name='challenge_list'),
    path('<int:id>/block/',ChallengeBlockView.as_view(),name='block-challenge'),
    path('<int:id>/',ChallengeDetailView.as_view(),name='challenge-detail'),
    path('run/',RunChallengeView.as_view(),name='run-challenge'),
    path('submit/',SubmitChallengeView.as_view(),name='submit-challenge'),
    path('<int:id>/submissions/',SubmissionListView.as_view(),name='submissions'),
    path('<int:id>/update/',ChallengeUpdateView.as_view(),name='update_challenge'),

]
