import axiosInstance from "@/api/axiosInstance"
import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { X, Menu, Users, Crown, UserPlus, Trash2, Settings, Shield, Hash, Paperclip } from "lucide-react"
import toast from "react-hot-toast"

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
  const [selectedFile, setSelectedFile] = useState(null)
  const typingTimeoutRef = useRef(null)
  const messagesEndRef = useRef(null)
  const roomIdRef = useRef(null)
  const fileInputRef = useRef(null)
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
            setTyping(data.is_typing ? data.sender_name : false)
          }
        } else if (data.type === "delete") {
          setMessages((prev) => prev.filter((msg) => msg.message_id !== data.message_id))
        } else if (data.type === "reaction") {
          setMessages((prevMessages) =>
            prevMessages.map((msg) => {
              if (msg.message_id === data.message_id) {
                const currentReactions = msg.reactions || []
                const updatedReactions =
                  data.action === "added"
                    ? [...currentReactions, { user_id: data.user_id, emoji: data.emoji }]
                    : currentReactions.filter((r) => !(r.user_id === data.user_id && r.emoji === data.emoji))
                return { ...msg, reactions: updatedReactions }
              }
              return msg
            }),
          )
        } else {
          setMessages((prev) => [...prev, data])
          if (id) {
            axiosInstance
              .post("/chat/mark-as-read/", { chatroom_id: id })
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
      navigate('/chat')
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

  const sendMessage = async () => {
    if (!input.trim() && !selectedFile) return
    let attachment_url = null
    if (selectedFile) {
      attachment_url = await uploadFile()
      if (!attachment_url) return
    }
    const messageData = {
      message: input.trim(),
      sender_id: currentUserId,
      attachment_url: attachment_url,
    }
    try {
      socket.send(JSON.stringify(messageData))
      setInput("")
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = null
      }
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

  const handleReaction = (messageId, emoji) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return
    socket.send(
      JSON.stringify({
        type: "reaction",
        message_id: messageId,
        user_id: currentUserId,
        emoji: emoji,
      }),
    )
  }

  const getGroupedReactions = (reactions) => {
    const grouped = {}
    reactions?.forEach(({ emoji, user_id }) => {
      if (!grouped[emoji]) grouped[emoji] = []
      grouped[emoji].push(user_id)
    })
    return grouped
  }

  const handleMessageClick = (messageId, senderId) => {
    setSelectedMessageId(selectedMessageId === messageId ? null : messageId)
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

  const handleMakeAdmin = async (userId) => {
    try {
      const res = await axiosInstance.post(`/chat/group-details/${id}/make-admin`, { user_id: userId })
      if (res.data.success) {
        setMembers((prev) => prev.map((m) => (m.id === userId ? { ...m, is_admin: true } : m)))
      }
    } catch (err) {
      console.error("failed to make user admin", err)
    }
  }

  const uploadFile = async () => {
    if (!selectedFile) return null
    const formData = new FormData()
    formData.append("file", selectedFile)
    try {
      const res = await axiosInstance.post("chat/upload-attachment/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      return res.data.attachment_url
    } catch (err) {
      console.error("file upload error", err)
      return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto max-w-4xl h-screen flex flex-col relative">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 backdrop-blur-sm hover:scale-105 active:scale-95"
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
                <div
                  className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"}`}
                ></div>
                <span className="text-white/70">{isConnected ? "Connected" : "Disconnected"}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 backdrop-blur-sm hover:scale-105 active:scale-95"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 mt-4 p-4 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg backdrop-blur-sm animate-pulse">
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
          <div className="h-full overflow-y-auto bg-white/5 backdrop-blur-md rounded-xl border-2 border-white/20 p-4 space-y-4 shadow-2xl" onClick={() => setSelectedMessageId(null)}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-6 border border-white/10">
                  <Users className="w-10 h-10 text-white/60" />
                </div>
                <p className="text-white/60 text-xl font-medium">No messages yet</p>
                <p className="text-white/40 text-sm mt-2">Start the group conversation!</p>
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
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white ml-auto hover:from-blue-700 hover:to-blue-800"
                            : "bg-white/10 text-white backdrop-blur-sm hover:bg-white/15"
                        } p-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] ${
                          selectedMessageId === msg.message_id ? "ring-2 ring-blue-400 scale-[1.02]" : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation(); 
                          handleMessageClick(msg.message_id, msg.sender_id);
                        }}
                      >
                        <p className="text-sm sm:text-base break-words leading-relaxed">{msg.message}</p>
                        {msg.attachment && (
                          <div className="mt-3">
                            <img
                              src={msg.attachment || "/placeholder.svg"}
                              alt="attachment"
                              className="max-w-xs rounded-lg border border-white/20 shadow-md"
                              onError={(e) => {
                                console.error("Failed to load image:", e.target.src)
                                e.target.style.display = "none"
                              }}
                              onLoad={() => {
                                console.log("Image loaded successfully:", msg.attachment)
                              }}
                            />
                          </div>
                        )}
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div className="flex gap-2 mt-3 flex-wrap">
                            {Object.entries(getGroupedReactions(msg.reactions)).map(([emoji, users]) => (
                              <div
                                key={emoji}
                                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-white/10 text-white shadow-md border border-white/20 ${
                                  users.includes(currentUserId) ? "ring-2 ring-blue-400 bg-blue-500/20" : ""
                                }`}
                              >
                                <span className="text-base">{emoji}</span>
                                <span className="font-medium">{users.length}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Enhanced Delete Option - shown when message is selected */}
                        {selectedMessageId === msg.message_id && msg.sender_id === currentUserId && (
                          <div className="absolute -bottom-12 right-0 z-10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteMessage(msg.message_id)
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 border border-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="text-sm font-medium">Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                      {msg.timestamp && (
                        <div
                          className={`text-xs text-white/40 mt-2 px-2 ${
                            msg.sender_id === currentUserId ? "text-right" : "text-left"
                          }`}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      )}
                      {selectedMessageId === msg.message_id && msg.sender_id !== currentUserId && (
                        <div className="flex gap-2 mt-3 ml-2">
                          {["❤️", "😂", "👍", "🔥", "👀"].map((emoji) => {
                            const alreadyReacted = msg.reactions?.some(
                              (r) => r.user_id === currentUserId && r.emoji === emoji,
                            )
                            return (
                              <button
                                key={emoji}
                                onClick={() => handleReaction(msg.message_id, emoji)}
                                className={`text-2xl hover:scale-125 transition-all duration-200 p-2 rounded-full ${
                                  alreadyReacted
                                    ? "opacity-100 scale-110 ring-2 ring-blue-400 bg-blue-500/20"
                                    : "opacity-60 hover:opacity-100 hover:bg-white/10"
                                }`}
                                title={alreadyReacted ? "Remove reaction" : "React"}
                              >
                                {emoji}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {/* Typing Indicator */}
                {typing && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20">
                      <div className="flex items-center gap-2">
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
                        <span className="text-white/60 text-sm ml-2">{typing && `${typing} is typing...`}</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Enhanced Input Area */}
        <div className="p-4 bg-white/10 backdrop-blur-md border-t border-white/20">
          <div className="flex gap-3 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="hidden"
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              />

              {/* File attachment indicator */}
              {selectedFile && (
                <div className="mb-2 flex items-center gap-2 p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                  <Paperclip className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 text-sm font-medium">{selectedFile.name}</span>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="ml-auto p-1 hover:bg-red-500/20 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3 text-red-400" />
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                {/* File attachment button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200 backdrop-blur-sm hover:scale-105 active:scale-95 border border-white/20"
                  title="Attach file"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                <input
                  type="text"
                  value={input}
                  onChange={handleTyping}
                  onKeyDown={handleKeyPress}
                  className="flex-1 p-4 pr-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base"
                  placeholder="Type a message..."
                  disabled={!isConnected}
                />
                {input.trim() && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={sendMessage}
              className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-lg"
              disabled={!isConnected || (!input.trim() && !selectedFile)}
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

        {/* Enhanced Sliding Details Panel */}
        <div
          className={`fixed top-0 right-0 h-full w-96 sm:w-[28rem] md:w-[32rem] bg-gradient-to-b from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-xl border-l border-white/20 transform transition-transform duration-300 ease-in-out z-50 shadow-2xl ${
            showDetails ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-6 h-full overflow-y-auto">
            {/* Enhanced Close Button */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-white" />
                <h3 className="text-xl font-bold text-white">Group Details</h3>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {groupDetails && (
              <div className="space-y-6">
                {/* Enhanced Group Info */}
                <div className="bg-gradient-to-r from-white/10 to-white/5 rounded-xl p-6 border border-white/20 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <Hash className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">{groupDetails.name}</h4>
                      <p className="text-white/60 text-sm">Group Chat</p>
                    </div>
                  </div>
                  {groupDetails.description && (
                    <p className="text-white/80 text-sm mb-4 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/10">
                      {groupDetails.description}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                      <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
                        <Users className="w-4 h-4" />
                        <span>Members</span>
                      </div>
                      <p className="text-white font-semibold">
                        {members.length}/{groupDetails.member_limit}
                      </p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                      <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
                        <Shield className="w-4 h-4" />
                        <span>Privacy</span>
                      </div>
                      <p className="text-white font-semibold">{groupDetails.is_private ? "Private" : "Public"}</p>
                    </div>
                  </div>
                </div>

                {/* Enhanced Members Section */}
                <div className="bg-gradient-to-r from-white/10 to-white/5 rounded-xl p-6 border border-white/20 shadow-lg">
                  <h4 className="font-bold text-white mb-6 flex items-center gap-3 text-lg">
                    <Users className="w-6 h-6" />
                    Members ({members.length})
                  </h4>
                  <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                    {members.map((member) => (
                      <div
                        key={member.id || member.email}
                        className="group flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-white text-sm font-bold">
                                {member.username?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            {member.is_admin && (
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                                <Crown className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <p className="text-white text-base font-semibold">{member.username}</p>
                              {member.is_admin && (
                                <span className="px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-yellow-400/20 text-yellow-400 text-xs font-medium rounded-full border border-yellow-500/30 shadow-sm">
                                  <Crown className="w-3 h-3 inline mr-1" />
                                  Admin
                                </span>
                              )}
                            </div>
                            <p className="text-white/60 text-sm">{member.email}</p>
                          </div>
                        </div>

                        {/* Enhanced Admin Controls */}
                        {members.find((m) => m.id === currentUserId)?.is_admin && currentUserId !== member.id && (
                          <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-200 ml-4">
                            {!member.is_admin && (
                              <button
                                onClick={() => handleMakeAdmin(member.id)}
                                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-500/20 to-yellow-400/20 hover:from-yellow-500/30 hover:to-yellow-400/30 text-yellow-400 hover:text-yellow-300 text-xs font-medium rounded-lg border border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm whitespace-nowrap"
                                title="Make Admin"
                              >
                                <Crown className="w-3 h-3" />
                                <span>Make Admin</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-red-500/20 to-red-400/20 hover:from-red-500/30 hover:to-red-400/30 text-red-400 hover:text-red-300 text-xs font-medium rounded-lg border border-red-500/30 hover:border-red-400/50 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm whitespace-nowrap"
                              title="Remove Member"
                            >
                              <X className="w-3 h-3" />
                              {/* <span>Remove</span> */}
                            </button>
                          </div>
                        )}

                        {/* Current User Indicator */}
                        {member.id === currentUserId && (
                          <div className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full border border-blue-500/30">
                            You
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enhanced Add Member Section */}
                {members.find((m) => m.id === currentUserId)?.is_admin && (
                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-500/20 shadow-lg">
                    <h4 className="font-bold text-white mb-6 flex items-center gap-3 text-lg">
                      <UserPlus className="w-6 h-6 text-green-400" />
                      Add New Member
                    </h4>
                    <div className="space-y-4">
                      <select
                        value={selectedUserId || ""}
                        onChange={(e) => setSelectedUserId(Number(e.target.value))}
                        className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="" className="bg-gray-800">
                          Select a user to add
                        </option>
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
                        className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <UserPlus className="w-5 h-5" />
                          Add Member
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Overlay */}
        {showDetails && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={() => setShowDetails(false)}
          ></div>
        )}
      </div>
    </div>
  )
}

export default GroupChatRoom
