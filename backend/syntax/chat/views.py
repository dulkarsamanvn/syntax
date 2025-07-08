from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from accounts.models import User
from rest_framework.response import Response
from chat.models import ChatRoom,Membership,Group
from chat.serializers import ChatRoomListSerializer
from rest_framework import status
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

        Membership.objects.create(user=request.user,chatroom=chatroom)

        for user in users:
            Membership.objects.get_or_create(user=user,chatroom=chatroom)
        
        return Response({
            "message": "Group created successfully",
            "group_id": group.id,
            "chatroom_id": chatroom.id
        },status=status.HTTP_201_CREATED)