import axiosInstance from '@/api/axiosInstance'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

function GroupChatRoom() {
    const {id} = useParams()
    const [currentUserId,setCurrentUserId]=useState(null)
    const [isConnected,setIsConnected]=useState(false)
    const [error,setError]=useState(null)
    const [messages,setMessages]=useState([])
    const [socket,setSocket]=useState(null)
    const [input,setInput]=useState('')
    const messagesEndRef =useRef(null)
    const navigate=useNavigate()


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])
    
    useEffect(()=>{
        const fetchProfile = async () => {
            try {
                const res = await axiosInstance.get("/profile/", { withCredentials: true })
                console.log("Fetched profile:", res.data);
                setCurrentUserId(res.data.id)
            } catch (err) {
                console.error("Error fetching profile:", err)
                setError("Failed to fetch user profile")
            }
        }
        fetchProfile()
    },[])

    useEffect(()=>{
        if(!currentUserId) return

        const ws=new WebSocket(`ws://localhost:8000/ws/chat/${id}/`)

        ws.onopen=()=>{
            console.log("WebSocket connected!");
            setIsConnected(true)
        }

        ws.onmessage=(e)=>{
            const data=JSON.parse(e.data)
            if(data.error){
                setError(data.error)
                console.error("ws error",data.error)
            }else{
                setMessages(prev=>[...prev,data])
            }
        }

        ws.onerror = (e) => {
            console.error("WebSocket error:", e);
            setError("WebSocket connection error")
            setIsConnected(false)
        };

        ws.onclose = () => {
            console.log('WebSocket closed')
            setIsConnected(false)
        }

        setSocket(ws)


        return ()=>{
            if(ws.readyState=== WebSocket.OPEN){
                ws.close(1000, 'Component unmounted')
            }
        }


    },[id,currentUserId])

    const sendMessage=()=>{
        if(!input.trim())return

        const messageData={
            message: input.trim(),
            sender_id: currentUserId
        }

        try{
            socket.send(JSON.stringify(messageData))
            setInput('')
        }catch(err){
            console.error('error sending message',err)
            setError("Failed to send message")
        }
    }

    const handleKeyPress=(e)=>{
        if(e.key==='Enter'){
            e.preventDefault()
            sendMessage()
        }
    }



  return (
    <div className="p-4 h-screen bg-black text-white flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => navigate(-1)} className="text-blue-500 hover:underline">← Back</button>
        <h2 className="text-lg font-semibold">Group Chat</h2>
      </div>

      {error && <div className="bg-red-500 p-2 rounded mb-2">{error}</div>}

      <div className="flex-1 overflow-y-auto bg-gray-800 rounded p-4 mb-2">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-2 ${msg.sender_id === currentUserId ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block px-3 py-2 rounded ${
              msg.sender_id === currentUserId ? 'bg-blue-600' : 'bg-gray-600'
            }`}>
              {msg.message}
            </div>
            {msg.timestamp && (
              <div className="text-xs text-gray-400 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 p-2 rounded-l bg-gray-100 text-black focus:outline-none"
          disabled={!isConnected}
        />
        <button
          onClick={sendMessage}
          disabled={!isConnected || !input.trim()}
          className="px-4 bg-blue-600 text-white rounded-r hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default GroupChatRoom
