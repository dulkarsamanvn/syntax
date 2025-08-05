import React, { useEffect } from 'react'

function useChatNotificationSocket(userId,fetchUnreadChatCount) {
    const WS_URL=import.meta.env.VITE_WS_BASE

    useEffect(()=>{
        if(!userId) return

        const socket=new WebSocket(`${WS_URL}/ws/notifications/`)
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
