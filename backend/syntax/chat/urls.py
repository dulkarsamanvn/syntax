from django.urls import path
from chat.views import CreateOrGetRoomView,ChatRoomsListView,CreateGroupView,GroupDetailsView,RemoveGroupMemberView,PreviousChatUsers,AddGroupMemberView,MarkUnreadMessagesView,MakeAdminView,UploadAttachmentView,GroupListView,GroupBlockView,UserGroupListView,JoinGroupView,UnreadChatCountView

urlpatterns = [
   path('create-or-get-room/',CreateOrGetRoomView.as_view(),name='create-or-get-room'),
   path('chatroomlist/',ChatRoomsListView.as_view(),name='chatroomlist'),
   path('create-group/',CreateGroupView.as_view(),name='create-group'),
   path('group-details/<int:chatroom_id>/',GroupDetailsView.as_view(),name='group-details'),
   path('group-details/<int:chatroom_id>/remove-member',RemoveGroupMemberView.as_view(),name='remove-group-member'),
   path('previous-chat-users/',PreviousChatUsers.as_view(),name='previous-chat-users'),
   path('group-details/<int:chatroom_id>/add-member',AddGroupMemberView.as_view(),name='add-group-member'),
   path('mark-as-read/',MarkUnreadMessagesView.as_view(),name='mark-as-read'),
   path('group-details/<int:id>/make-admin',MakeAdminView.as_view(),name='make-admin'),
   path('upload-attachment/',UploadAttachmentView.as_view(),name='upload-attachment'),
   path('group-list/',GroupListView.as_view(),name='group-list'),
   path('<int:group_id>/block/',GroupBlockView.as_view(),name='block-group'),
   path('groups-list/user/',UserGroupListView.as_view(),name='groupslist'),
   path('<int:group_id>/join/',JoinGroupView.as_view(),name='join-group'),
   path('unread-count/',UnreadChatCountView.as_view(),name='unread-count'),
]
