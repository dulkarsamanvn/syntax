import React, { useEffect } from 'react'
import toast from 'react-hot-toast'

function useSystemNotificationSocket(userId) {

 useEffect(()=>{
    if(!userId) return

    const socket=new WebSocket('ws://localhost:8000/ws/system-notifications/')

    socket.onmessage=(event)=>{
        const data=JSON.parse(event.data)
        toast.success(data.message)
    }

    return ()=>socket.close()

 },[userId])   
}

export default useSystemNotificationSocket
