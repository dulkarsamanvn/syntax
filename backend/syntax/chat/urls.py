from django.urls import path
from chat.views import CreateOrGetRoomView,ChatRoomsListView,CreateGroupView,GroupDetailsView,RemoveGroupMemberView,PreviousChatUsers,AddGroupMemberView

urlpatterns = [
   path('create-or-get-room/',CreateOrGetRoomView.as_view(),name='create-or-get-room'),
   path('chatroomlist/',ChatRoomsListView.as_view(),name='chatroomlist'),
   path('create-group/',CreateGroupView.as_view(),name='create-group'),
   path('group-details/<int:chatroom_id>/',GroupDetailsView.as_view(),name='group-details'),
   path('group-details/<int:chatroom_id>/remove-member',RemoveGroupMemberView.as_view(),name='remove-group-member'),
   path('previous-chat-users/',PreviousChatUsers.as_view(),name='previous-chat-users'),
   path('group-details/<int:chatroom_id>/add-member',AddGroupMemberView.as_view(),name='add-group-member'),
]
