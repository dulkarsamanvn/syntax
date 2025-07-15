import axiosInstance from "@/api/axiosInstance"
import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { X, Menu, Users, Crown, UserPlus } from "lucide-react"

function GroupChatRoom() {
  const { id } = useParams()
  const [currentUserId, setCurrentUserId] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState(null)
  const [messages, setMessages] = useState([])
  const [socket, setSocket] = useState(null)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [typing, setTyping] = useState(false)
  const [groupDetails, setGroupDetails] = useState([])
  const [members, setMembers] = useState([])
  const [showDetails, setShowDetails] = useState(false)
  const [chatUsers, setChatUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [selectedMessageId, setSelectedMessageId] = useState(null)
  const typingTimeoutRef = useRef(null)
  const messagesEndRef = useRef(null)
  const roomIdRef=useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchGroupInfo = async () => {
      const res = await axiosInstance.get(`/chat/group-details/${id}/`)
      setGroupDetails(res.data.group)
      setMembers(res.data.members)
    }
    if (id) fetchGroupInfo()
  }, [id])

  useEffect(() => {
    const fetchChatUsers = async () => {
      try {
        const res = await axiosInstance.get(`/chat/previous-chat-users/?chatroom_id=${id}`)
        setChatUsers(res.data)
      } catch (err) {
        console.error("error fetching chatusers", err)
      }
    }
    if (id) fetchChatUsers()
  }, [id, members])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

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
    if (!currentUserId) return
    const ws = new WebSocket(`ws://localhost:8000/ws/chat/${id}/`)
    ws.onopen = () => {
      console.log("WebSocket connected!")
      setIsConnected(true)
      roomIdRef.current = id
      
    }
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data)
      if (data.error) {
        setError(data.error)
        console.error("ws error", data.error)
      } else {
        if (data.type === "typing") {
          if (data.sender_id !== currentUserId) {
            setTyping(data.is_typing)
          }
        } else if (data.type === "delete") {
          setMessages((prev) => prev.filter((msg) => msg.message_id !== data.message_id))
        } else {
          setMessages((prev) => [...prev, data])
          if (id) {
            axiosInstance.post("/chat/mark-as-read/", { chatroom_id: id })
              .then(() => console.log("Group message marked as read"))
              .catch((err) => console.error("Mark-as-read failed", err))
          }

        }
      }
    }
    ws.onerror = (e) => {
      console.error("WebSocket error:", e)
      setError("WebSocket connection error")
      setIsConnected(false)
    }
    ws.onclose = () => {
      console.log("WebSocket closed")
      setIsConnected(false)
    }
    setSocket(ws)
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close(1000, "Component unmounted")
      }
    }
  }, [id, currentUserId])

  useEffect(() => {
    if (id && currentUserId) {
      axiosInstance
        .post("/chat/mark-as-read/", { chatroom_id: id })
        .then(() => console.log("Group messages marked as read"))
        .catch((err) => console.error("Failed to mark group messages as read", err))
    }
  }, [id, currentUserId])

  


  const sendMessage = () => {
    if (!input.trim()) return
    const messageData = {
      message: input.trim(),
      sender_id: currentUserId,
    }
    try {
      socket.send(JSON.stringify(messageData))
      setInput("")
    } catch (err) {
      console.error("error sending message", err)
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

  const handleRemoveMember = async (userId) => {
    try {
      const res = await axiosInstance.post(`/chat/group-details/${id}/remove-member`, { user_id: userId })
      if (res.data.success) {
        setMembers((prev) => prev.filter((member) => member.id !== userId))
      }
    } catch (err) {
      console.error("failed to remove member", err)
    }
  }

  const handleAddMember = async () => {
    if (!selectedUserId) return
    try {
      const res = await axiosInstance.post(`/chat/group-details/${id}/add-member`, { user_id: selectedUserId })
      if (res.data.success) {
        setMembers((prev) => [...prev, res.data.user])
        setSelectedUserId(null)
      }
    } catch (err) {
      console.error("failed to add member", err)
    }
  }

  const handleMakeAdmin=async(userId)=>{
    try{
      const res=await axiosInstance.post(`/chat/group-details/${id}/make-admin`,{user_id:userId})
      if(res.data.success){
        setMembers((prev)=>
          prev.map((m)=>(m.id===userId ? {...m,is_admin:true}:m))
        )
      }
    }catch(err){
      console.error('failed to make user admin',err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto max-w-4xl h-screen flex flex-col relative">
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

          <div className="flex items-center gap-3">
            <div className="text-center">
              <h2 className="text-white text-lg font-semibold">{groupDetails.name || "Group Chat"}</h2>
              <div className="flex items-center justify-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"}`}></div>
                <span className="text-white/70">{isConnected ? "Connected" : "Disconnected"}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 backdrop-blur-sm"
          >
            <Menu className="w-5 h-5" />
          </button>
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
                  <Users className="w-8 h-8 text-white/60" />
                </div>
                <p className="text-white/60 text-lg font-medium">No messages yet</p>
                <p className="text-white/40 text-sm mt-1">Start the group conversation!</p>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender_id === currentUserId ? "justify-end" : "justify-start"}`}
                  >
                    <div className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
                      <div
                        className={`relative group cursor-pointer transition-all duration-200 ${
                          msg.sender_id === currentUserId
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
                            msg.sender_id === currentUserId ? "text-right" : "text-left"
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
                        <span className="text-white/60 text-sm ml-2">Someone is typing...</span>
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
                onKeyDown={handleKeyPress}
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

        {/* Sliding Details Panel */}
        <div
          className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-white/10 backdrop-blur-md border-l border-white/20 transform transition-transform duration-300 ease-in-out z-50 ${
            showDetails ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-6 h-full overflow-y-auto">
            {/* Close Button */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Group Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {groupDetails && (
              <div className="space-y-6">
                {/* Group Info */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-2">{groupDetails.name}</h4>
                  <p className="text-white/70 text-sm mb-3">{groupDetails.description}</p>
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {members.length}/{groupDetails.member_limit}
                    </span>
                    <span>{groupDetails.is_private ? "Private" : "Public"}</span>
                  </div>
                </div>

                {/* Members Section */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Members ({members.length})
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {members.map((member) => (
                      <div
                        key={member.id || member.email}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {member.username?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium flex items-center gap-1">
                              {member.username}
                              {member.is_admin && <Crown className="w-3 h-3 text-yellow-400" />}
                            </p>
                            <p className="text-white/50 text-xs">{member.email}</p>
                          </div>
                        </div>
                        {members.find(m => m.id === currentUserId)?.is_admin && currentUserId !== member.id &&(
                          <div className="flex gap-2">
                            <button  onClick={()=>handleMakeAdmin(member.id)}
                              disabled={member.is_admin}
                              className={`p-1 rounded transition-all duration-200 text-xs ${
                                member.is_admin
                                  ? 'text-gray-400 cursor-not-allowed opacity-50'
                                  : 'text-yellow-400 hover:bg-yellow-400/20'
                              }`}>
                              Make Admin
                            </button>
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-all duration-200"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Member Section (Only for group creator) */}
                {members.find(m => m.id === currentUserId)?.is_admin && (
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <UserPlus className="w-5 h-5" />
                      Add Member
                    </h4>
                    <div className="space-y-3">
                      <select
                        value={selectedUserId || ""}
                        onChange={(e) => setSelectedUserId(Number(e.target.value))}
                        className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a user to add</option>
                        {chatUsers
                          .filter((user) => !members.some((member) => member.id === user.id))
                          .map((user) => (
                            <option key={user.id} value={user.id} className="bg-gray-800">
                              {user.username} ({user.email})
                            </option>
                          ))}
                      </select>
                      <button
                        onClick={handleAddMember}
                        disabled={!selectedUserId}
                        className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 active:scale-95"
                      >
                        Add Member
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Overlay */}
        {showDetails && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setShowDetails(false)}></div>
        )}
      </div>
    </div>
  )
}

export default GroupChatRoom
