from django.urls import path
from challenge.views import ChallengeCreateView,ChallengeListView,ChallengeBlockView,ChallengeDetailView,RunChallengeView,SubmitChallengeView,SubmissionListView,ChallengeUpdateView,SolutionListView,CreateSolutionView,SolutionEditView,SolutionDeleteView,CompletedLanguagesStatsView,UserDomainStatsView

urlpatterns = [
    path('create/',ChallengeCreateView.as_view(),name='create_challenge'),
    path('list/',ChallengeListView.as_view(),name='challenge_list'),
    path('<int:id>/block/',ChallengeBlockView.as_view(),name='block-challenge'),
    path('<int:id>/',ChallengeDetailView.as_view(),name='challenge-detail'),
    path('run/',RunChallengeView.as_view(),name='run-challenge'),
    path('submit/',SubmitChallengeView.as_view(),name='submit-challenge'),
    path('<int:id>/submissions/',SubmissionListView.as_view(),name='submissions'),
    path('<int:id>/update/',ChallengeUpdateView.as_view(),name='update_challenge'),
    path('<int:challenge_id>/add-solution/',CreateSolutionView.as_view(),name='create-solution'),
    path('<int:challenge_id>/solutions/',SolutionListView.as_view(),name='solution-list'),
    path('<int:challenge_id>/edit-solution/<int:solution_id>/',SolutionEditView.as_view(),name='edit-solution'),
    path('<int:challenge_id>/delete-solution/<int:solution_id>/',SolutionDeleteView.as_view(),name='delete-solution'),
    path('language-stats/',CompletedLanguagesStatsView.as_view(),name='language-stats'),
    path('domain-stats/',UserDomainStatsView.as_view(),name='domain-stats'),

]
