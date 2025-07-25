from django.urls import path
from notification.views import MarkAllNotificationReadView,UserNotificationListView,UnreadNotificationCountView

urlpatterns = [
    path('notification-list/',UserNotificationListView.as_view(),name='notification-list'),
    path('mark-all-read/',MarkAllNotificationReadView.as_view(),name='mark-all-read'),
    path('unread-count/',UnreadNotificationCountView.as_view(),name='unread-count'),
]
