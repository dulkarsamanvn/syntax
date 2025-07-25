import React, { useEffect } from 'react'

function useChatNotificationSocket(userId,fetchUnreadChatCount) {
    useEffect(()=>{
        if(!userId) return

        const socket=new WebSocket('ws://localhost:8000/ws/notifications/')
        socket.onmessage=(event)=>{
            const data=JSON.parse(event.data)
            if(data.type==='new_message'){
                fetchUnreadChatCount()
            }
        }

        return ()=>socket.close()
    },[userId])
}

export default useChatNotificationSocket
