from django.urls import path
from badge.views import BadgeCreateView,BadgeListView,BadgeUpdateView,BadgeBlockView,UserEarnedBadgesView

urlpatterns = [
    path('create-badge/',BadgeCreateView.as_view(),name='create-badge'),
    path('<int:badge_id>/update-badge/',BadgeUpdateView.as_view(),name='update-badge'),
    path('badge-list/',BadgeListView.as_view(),name='badge-list'),
    path('<int:badge_id>/block/',BadgeBlockView.as_view(),name='block-badge'),
    path('earned-badges/',UserEarnedBadgesView.as_view(),name='earned-badges'),
]
