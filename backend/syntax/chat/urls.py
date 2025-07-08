from django.urls import path
from chat.views import CreateOrGetRoomView,ChatRoomsListView,CreateGroupView

urlpatterns = [
   path('create-or-get-room/',CreateOrGetRoomView.as_view(),name='create-or-get-room'),
   path('chatroomlist/',ChatRoomsListView.as_view(),name='chatroomlist'),
   path('create-group/',CreateGroupView.as_view(),name='create-group'),
]
