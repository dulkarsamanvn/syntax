import axiosInstance from "@/api/axiosInstance"
import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

function ChatRoom() {
  const { userId } = useParams()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [socket, setSocket] = useState(null)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const [typing, setTyping] = useState(false)
  const [selectedMessageId, setSelectedMessageId] = useState(null)
  const typingTimeoutRef = useRef(null)
  const roomIdRef = useRef()
  const messagesEndRef=useRef(null)
  const navigate = useNavigate()


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("/profile/", { withCredentials: true })
        console.log("Fetched profile:", res.data)
        setCurrentUserId(res.data.id)
      } catch (err) {
        console.error("Error fetching profile:", err)
        setError("Failed to fetch user profile")
      }
    }
    fetchProfile()
  }, [])

  useEffect(() => {
    let newSocket = null
    const connectWebSocket = async () => {
      
      if (!currentUserId) {
        console.log("currentUserId not set yet, skipping WebSocket connection")
        return
      }
      try {
        setError(null)
        console.log("Creating or joining room for user:", currentUserId)

        const res = await axiosInstance.post("chat/create-or-get-room/", { user_id: userId })
        const roomId = res.data.room_id
        roomIdRef.current = roomId
        console.log("Connecting to WebSocket room:", roomId)
        newSocket = new WebSocket(`ws://localhost:8000/ws/chat/${roomId}/`)

        newSocket.onopen = () => {
          console.log("WebSocket connected!")
          setIsConnected(true)
          setError(null)
        }

        newSocket.onmessage = (e) => {
          console.log("Received WebSocket message:", e.data)
          try {
            const data = JSON.parse(e.data)
            if (data.error) {
              console.error("Server error:", data.error)
              setError(data.error)
            } else {
              if (data.type === "typing") {
                console.log("Typing event received", data)
                if (data.sender_id !== currentUserId) {
                  setTyping(data.is_typing)
                }
              } else if (data.type === "delete") {
                setMessages((prev) => prev.filter((msg) => msg.message_id !== data.message_id))
              } else {
                setMessages((prev) => [...prev, data])

                if(roomIdRef.current){
                  axiosInstance.post("/chat/mark-as-read/", { chatroom_id: roomIdRef.current })
                  .then(() => console.log("Marked as read"))
                  .catch((err)=>console.error("Mark-as-read failed", err))
                }
              }
            }
          } catch (err) {
            console.error("Error parsing message:", err)
          }
        }

        newSocket.onerror = (e) => {
          console.error("WebSocket error:", e)
          setError("WebSocket connection error")
          setIsConnected(false)
        }
        newSocket.onclose = (e) => {
          console.log("WebSocket closed:", e.code, e.reason)
          setIsConnected(false)
          if (e.code !== 1000) {
            setError("WebSocket connection closed unexpectedly")
          }
        }
        setSocket(newSocket)
      } catch (error) {
        console.error("Error creating room or connecting to WebSocket:", error)
        setError("Failed to connect to chat room")
      }
    }
    connectWebSocket()
    return () => {
      if (newSocket && newSocket.readyState === WebSocket.OPEN) {
        console.log("Closing WebSocket connection")
        newSocket.close(1000, "Component unmounting")
      }
    }
  }, [userId, currentUserId])

  

  useEffect(()=>{
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  },[messages])

  const sendMessage = () => {
    if (currentUserId === null || !socket || socket.readyState !== WebSocket.OPEN) {
      console.log("currentUserId is null, cannot send.")
      setError("User not authenticated")
      return
    }
    if (!input.trim()) {
      console.log("Message is empty")
      return
    }
    const messageData = {
      message: input.trim(),
      sender_id: currentUserId,
    }

    console.log("Sending message via WebSocket:", messageData)

    try {
      socket.send(JSON.stringify(messageData))
      setInput("")
      setError(null)
      console.log("Message sent successfully")
    } catch (err) {
      console.error("Error sending message:", err)
      setError("Failed to send message")
    }
  }

  const handleTyping = (e) => {
    const value = e.target.value
    setInput(value)
    if (!socket || socket.readyState !== WebSocket.OPEN || !currentUserId) return
    if (!isTyping) {
      setIsTyping(true)
      socket.send(
        JSON.stringify({
          sender_id: currentUserId,
          typing: true,
        }),
      )
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      socket.send(
        JSON.stringify({
          sender_id: currentUserId,
          typing: false,
        }),
      )
      setIsTyping(false)
    }, 2000)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleDeleteMessage = (message_id) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return
    socket.send(
      JSON.stringify({
        delete_id: message_id,
        sender_id: currentUserId,
      }),
    )
    setSelectedMessageId(null)
  }

  const handleMessageClick = (messageId, senderId) => {
    if (senderId === currentUserId) {
      setSelectedMessageId(selectedMessageId === messageId ? null : messageId)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto max-w-4xl h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-md border-b border-white/20">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 backdrop-blur-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"}`}></div>
            <span className="text-white text-sm font-medium">{isConnected ? "Connected" : "Disconnected"}</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 mt-4 p-4 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium">Error:</span> {error}
            </div>
          </div>
        )}

        {/* Messages Container */}
        <div className="flex-1 overflow-hidden mx-4 my-4">
          <div className="h-full overflow-y-auto bg-white/5 backdrop-blur-md rounded-xl border-2 border-white/20 p-4 space-y-4 shadow-2xl">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <p className="text-white/60 text-lg font-medium">No messages yet</p>
                <p className="text-white/40 text-sm mt-1">Start the conversation!</p>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender_id == currentUserId ? "justify-end" : "justify-start"}`}
                  >
                    <div className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
                      <div
                        className={`relative group cursor-pointer transition-all duration-200 ${
                          msg.sender_id == currentUserId
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white ml-auto"
                            : "bg-white/10 text-white backdrop-blur-sm"
                        } p-3 rounded-2xl shadow-lg hover:shadow-xl ${
                          selectedMessageId === msg.message_id ? "ring-2 ring-red-400" : ""
                        }`}
                        onClick={() => handleMessageClick(msg.message_id, msg.sender_id)}
                      >
                        <p className="text-sm sm:text-base break-words">{msg.message}</p>

                        {/* Delete option - shown when message is selected */}
                        {selectedMessageId === msg.message_id && msg.sender_id === currentUserId && (
                          <div className="absolute -top-2 -right-2 z-10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteMessage(msg.message_id)
                              }}
                              className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 transform hover:scale-110"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>

                      {msg.timestamp && (
                        <div
                          className={`text-xs text-white/40 mt-1 px-1 ${
                            msg.sender_id == currentUserId ? "text-right" : "text-left"
                          }`}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {typing && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl">
                      <div className="flex items-center gap-1">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <span className="text-white/60 text-sm ml-2">Typing...</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white/10 backdrop-blur-md border-t border-white/20">
          <div className="flex gap-2 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={handleTyping}
                onKeyPress={handleKeyPress}
                className="w-full p-3 pr-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Type a message..."
                disabled={!isConnected}
              />
              {input.trim() && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
            <button
              onClick={sendMessage}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-lg"
              disabled={!isConnected || !input.trim()}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatRoom
