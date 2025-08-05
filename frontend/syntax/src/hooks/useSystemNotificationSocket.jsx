import React, { useEffect } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

function useSystemNotificationSocket(userId,onNewNotification) {
  const navigate=useNavigate()

  const WS_URL=import.meta.env.VITE_WS_BASE

 useEffect(()=>{
    if(!userId) return

    const socket=new WebSocket(`${WS_URL}/ws/system-notifications/`)

    socket.onmessage=(event)=>{
        const data=JSON.parse(event.data)
        // toast.success(data.message)
        toast.custom((t) => (
        <div
          onClick={()=>{
            if(data.link) navigate(data.link)
            toast.dismiss(t.id)
          }}
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-4 py-3 rounded-lg shadow-lg max-w-md w-full`}
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

 },[userId,navigate,onNewNotification])   
}

export default useSystemNotificationSocket
