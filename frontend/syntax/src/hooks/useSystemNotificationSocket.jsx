import React, { useEffect } from 'react'
import toast from 'react-hot-toast'

function useSystemNotificationSocket(userId,onNewNotification) {

 useEffect(()=>{
    if(!userId) return

    const socket=new WebSocket('ws://localhost:8000/ws/system-notifications/')

    socket.onmessage=(event)=>{
        const data=JSON.parse(event.data)
        // toast.success(data.message)
        toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-4 py-3 rounded-lg shadow-lg max-w-md w-full`}
        >
          <strong className="block font-semibold">📢 Notification</strong>
          <span>{data.message}</span>
        </div>
      ))
      if(onNewNotification){
        onNewNotification()
      }
    }

    return ()=>socket.close()

 },[userId])   
}

export default useSystemNotificationSocket
