from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from accounts.models import User
from rest_framework.response import Response
from chat.models import ChatRoom,Membership,Group
from chat.serializers import ChatRoomListSerializer,GroupSerializer,UserSerializer
from rest_framework import status
from django.utils import timezone
import cloudinary.uploader
# Create your views here.

class CreateOrGetRoomView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request):
        target_user_id=request.data.get('user_id')
        current_user=request.user

        try:
            target_user=User.objects.get(id=target_user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)
        
        rooms=ChatRoom.objects.filter(is_group=False)
        for room in rooms:
            participants=room.participants.all()
            if target_user in participants and current_user in participants and participants.count()==2:
                return Response({'room_id':room.id})
        
        new_room=ChatRoom.objects.create(is_group=False)
        Membership.objects.create(user=target_user,chatroom=new_room)
        Membership.objects.create(user=current_user,chatroom=new_room)
        return Response({"room_id": new_room.id})


class ChatRoomsListView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        user=request.user
        rooms=ChatRoom.objects.filter(participants=user).prefetch_related('participants')
        serializer=ChatRoomListSerializer(rooms,many=True,context={'request':request})
        return Response(serializer.data)

class CreateGroupView(APIView):

    permission_classes=[IsAuthenticated]

    def post(self,request):
        data=request.data
        name=data.get('name')
        description=data.get('description','')
        member_limit=data.get('member_limit',10)
        is_private=data.get('is_private',False)
        creator=request.user
        user_ids=data.get('member_ids',[])

        if not name:
            return Response({'error':'Group name is Required'},status=status.HTTP_400_BAD_REQUEST)
        
        users=User.objects.filter(id__in=user_ids)
        if users.count() > member_limit -1:
            return Response({'error':'Member Limit Exceeded'},status=status.HTTP_400_BAD_REQUEST)
        
        group=Group.objects.create(
            name=name,
            description=description,
            member_limit=member_limit,
            is_private=is_private,
            creator=request.user
        )

        chatroom=ChatRoom.objects.create(
            is_group=True,
            group=group
        )

        Membership.objects.create(user=request.user,chatroom=chatroom,is_admin=True)

        for user in users:
            Membership.objects.get_or_create(user=user,chatroom=chatroom,defaults={'is_admin': False, 'joined_at': timezone.now()})
        
        return Response({
            "message": "Group created successfully",
            "group_id": group.id,
            "chatroom_id": chatroom.id
        },status=status.HTTP_201_CREATED)


class GroupDetailsView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request,chatroom_id):
        try:
            chatroom=ChatRoom.objects.get(id=chatroom_id)
            group=chatroom.group
            # members=[m.user for m in chatroom.memberships.select_related('user')]
            memberships=chatroom.memberships.select_related('user').all()

            members=[]
            for membership in memberships:
                user_data=UserSerializer(membership.user).data
                user_data['is_admin']=membership.is_admin
                members.append(user_data)
            return Response({
                'group':GroupSerializer(group).data,
                'members':members
            })
        except ChatRoom.DoesNotExist:
            return Response({'error':'Chatroom Not Found'},status=status.HTTP_404_NOT_FOUND)



class RemoveGroupMemberView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request,chatroom_id):
        user_id=request.data.get('user_id')
        try:
            chatroom=ChatRoom.objects.get(id=chatroom_id)
            group=chatroom.group
            current_membership=Membership.objects.get(user=request.user,chatroom=chatroom)
            if not current_membership.is_admin:
                return Response({'error': 'Only admins can remove members'},status=status.HTTP_403_FORBIDDEN)
            user_to_remove=User.objects.get(id=user_id)
            if user_to_remove==group.creator:
                return Response({'error': 'Cannot remove group creator'},status=status.HTTP_400_BAD_REQUEST)
            membership=Membership.objects.get(user_id=user_id,chatroom=chatroom)
            membership.delete()
            return Response({'success':True})
        except ChatRoom.DoesNotExist:
            return Response({'error':'Chatroom not found'},status=status.HTTP_404_NOT_FOUND)



class PreviousChatUsers(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        chatroom_id=request.query_params.get('chatroom_id')
        if not chatroom_id:
            return Response({'error':'chatroom_id is required'},status=status.HTTP_400_BAD_REQUEST)
        
        try:
            chatroom=ChatRoom.objects.get(id=chatroom_id)
        except ChatRoom.DoesNotExist:
            return Response({'error':'Chatroom not found'},status=status.HTTP_404_NOT_FOUND)
        current_members=set(chatroom.memberships.values_list('user_id',flat=True))
        rooms=ChatRoom.objects.filter(is_group=False,participants=request.user)
        users=set()
        for room in rooms.prefetch_related('participants'):
            for participant in room.participants.all():
                if participant != request.user and participant.id not in current_members:
                    users.add(participant)
        serialized=UserSerializer(users,many=True)
        return Response(serialized.data)
                    

class AddGroupMemberView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request,chatroom_id):
        user_id=request.data.get('user_id')
        try:
            chatroom=ChatRoom.objects.get(id=chatroom_id)
            group=chatroom.group

            current_membership = Membership.objects.get(user=request.user, chatroom=chatroom)
            if not current_membership.is_admin:
                return Response({'error': 'Only admins can add members'}, status=status.HTTP_403_FORBIDDEN)

            # if not request.user == group.creator:
            #     return Response({'error': 'Only the group creator can add members'}, status=403)
            if chatroom.memberships.count() >= group.member_limit:
                return Response({'error': 'Group member limit reached'}, status=400)
            user=User.objects.get(id=user_id)
            # Membership.objects.create(user=user,chatroom=chatroom)
            membership,created=Membership.objects.get_or_create(
                user=user,
                chatroom=chatroom,
                defaults={'is_admin': False, 'joined_at': timezone.now()}
            )
            if not created:
                return Response({'error': 'User is already a member'}, status=status.HTTP_400_BAD_REQUEST)
            
            user_data=UserSerializer(user).data
            user_data['is_admin']=membership.is_admin
            return Response({
                'success':True,
                'user':user_data
            })
        except ChatRoom.DoesNotExist:
            return Response({'error': 'Chatroom or User not found'}, status=404)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Membership.DoesNotExist:
            return Response({'error': 'You are not a member of this group'}, status=status.HTTP_403_FORBIDDEN)


class MarkUnreadMessagesView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request):
        chatroom_id=request.data.get('chatroom_id')
        user=request.user

        try:
            chatroom=ChatRoom.objects.get(id=chatroom_id,participants=user)
        except ChatRoom.DoesNotExist:
            return Response({'error':'chatroom not found'},status=status.HTTP_404_NOT_FOUND)
        count=chatroom.messages.filter(is_read=False).exclude(sender=user).update(is_read=True)
        return Response({'marked_read':count})


class MakeAdminView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request,id):
        user_id=request.data.get('user_id')
        try:
            chatroom=ChatRoom.objects.get(id=id)
            if not Membership.objects.filter(chatroom=chatroom,user=request.user,is_admin=True).exists():
                return Response({'error':'Only admins can promote members'},status=status.HTTP_403_FORBIDDEN)
            user_to_promote = User.objects.get(id=user_id)
            membership=Membership.objects.get(chatroom=chatroom,user=user_to_promote)
            membership.is_admin=True
            membership.save()

            user_data = UserSerializer(user_to_promote).data
            user_data['is_admin'] = True
            return Response({'success': True, 'message': 'user promoted to admin','user': user_data}, status=status.HTTP_200_OK)
        except ChatRoom.DoesNotExist:
            return Response({'error':'chatroom not found'},status=status.HTTP_404_NOT_FOUND)
        except Membership.DoesNotExist:
            return Response({'error':'user is not a member'},status=status.HTTP_404_NOT_FOUND)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


class UploadAttachmentView(APIView):
    permission_classes=[IsAuthenticated]

    def post(self,request):
        file = request.FILES.get("file")
        if not file:
            return Response({'error':'no file provided'},status=status.HTTP_400_BAD_REQUEST)
        try:
            result=cloudinary.uploader.upload(file, folder="chat_attachments/")
            return Response({
                'attachment_url':result['secure_url'],
            },status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)