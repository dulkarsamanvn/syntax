import axiosInstance from "@/api/axiosInstance"
import { useEffect, useRef, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { MessageCircle, Search, Users, X } from "lucide-react"
import Spinner from "@/Components/Spinner"

function ChatHome() {
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("chats") // "chats" or "groups"
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [groupLimit, setGroupLimit] = useState(10)
  const [chatUsers, setChatUsers] = useState([])
  const [selectedUserIds, setSelectedUserIds] = useState([])
  const [highlightedChatId, setHighlightedChatId] = useState(null)
  const [currentChatroomId,setCurrentChatroomId]=useState(null)
  const notificationSocket = useRef(null)
  const location=useLocation()
  const navigate = useNavigate()

  const WS_URL=import.meta.env.VITE_WS_BASE

  const fetchChats = async () => {
    try {
      setLoading(true)
      const res = await axiosInstance.get("/chat/chatroomlist/")
      setChats(res.data)
      const users = res.data
        .filter((chat) => chat.other_user)
        .map((chat) => ({
          id: chat.other_user.id,
          username: chat.other_user.username,
          avatar: chat.other_user.profile_photo_url,
        }))
      setChatUsers(users)
      setError(null)
    } catch (err) {
      console.error("error fetching chats", err)
      setError("Failed to load chats. Please try again.")
    } finally {
      setTimeout(() => {
        setLoading(false)
      }, 500)
    }
  }

  const refreshChats = async () => {
    try {
      const res = await axiosInstance.get("/chat/chatroomlist/")
      setChats(res.data)

      const users = res.data
        .filter((chat) => chat.other_user)
        .map((chat) => ({
          id: chat.other_user.id,
          username: chat.other_user.username,
          avatar: chat.other_user.profile_photo_url,
        }))
      setChatUsers(users)
      setError(null)
    } catch (err) {
      console.error("error refreshing chats", err)
    }
  }

  useEffect(() => {
    fetchChats()
  }, [location])

  useEffect(() => {
  if (currentChatroomId) {
    axiosInstance.post('/chat/mark-as-read/', {
      chatroom_id: currentChatroomId
    }).then(() => {
      refreshChats() // <- update unread count after marking read
    }).catch(err => console.error("Mark as read failed", err))
  }
}, [currentChatroomId])


  useEffect(() => {
    notificationSocket.current = new WebSocket(`${WS_URL}/ws/notifications/`)
    notificationSocket.current.onopen = () => {
      console.log("notification socket Connected")
    }
    notificationSocket.current.onmessage = (e) => {
      const data = JSON.parse(e.data)
      console.log("notification received", data)
      if (data.type === "new_message") {
        setHighlightedChatId(data.chatroom_id)
        setTimeout(() => {
          refreshChats()
        }, 100)
      } else if (data.type === "new_group") {
        setTimeout(() => {
          refreshChats()
        }, 100)
      }
    }
    notificationSocket.current.onclose = () => {
      console.log("connection closed")
    }
    return () => {
      if (notificationSocket.current) {
        notificationSocket.current.close()
      }
    }
  }, [])

  // Filter chats based on active tab and search term
  const filteredChats = chats.filter((chat) => {
    const matchesSearch = chat.is_group
      ? chat.group_name?.toLowerCase().includes(searchTerm.toLowerCase())
      : chat.other_user?.username?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTab = activeTab === "groups" ? chat.is_group : !chat.is_group

    return matchesSearch && matchesTab
  })

  // Get counts for tabs
  const chatCount = chats.filter((chat) => !chat.is_group).length
  const groupCount = chats.filter((chat) => chat.is_group).length

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return alert("group name is required")
    try {
      const res = await axiosInstance.post("/chat/create-group/", {
        name: groupName,
        description: groupDescription,
        member_limit: groupLimit,
        is_private: isPrivate,
        member_ids: selectedUserIds,
      })
      setActiveTab("groups");
      navigate(`/chat/group/${res.data.chatroom_id}`);
      setHighlightedChatId(res.data.chatroom_id);
    } catch (err) {
      console.error("Error Creating Group", err)
    } finally {
      setShowGroupModal(false)
      setGroupName("")
      setGroupDescription("")
      setGroupLimit(10)
      setSelectedUserIds([])
      setIsPrivate(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-black">
        <div className="bg-gray-900 border-b border-gray-800 p-4">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-blue-400" />
              Messages
            </h1>
          </div>
        </div>
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen bg-black">
        <div className="bg-gray-900 border-b border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-blue-400" />
              Messages
            </h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Something went wrong</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="flex items-center gap-3 mb-4 justify-between">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-blue-400" />
            Messages
          </h1>
          <button
            onClick={() => setShowGroupModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-lg"
          >
            + Create Group
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-4 bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("chats")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === "chats" ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all" : "text-gray-300 hover:text-white hover:bg-gray-700"
              }`}
          >
            <MessageCircle className="h-4 w-4" />
            Chats
            {chatCount > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-gray-700 text-gray-300">{chatCount}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("groups")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === "groups" ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all" : "text-gray-300 hover:text-white hover:bg-gray-700"
              }`}
          >
            <Users className="h-4 w-4" />
            Groups
            {groupCount > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-gray-700 text-gray-300">{groupCount}</span>
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Chat/Group List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
              {activeTab === "chats" ? (
                <MessageCircle className="h-8 w-8 text-gray-500" />
              ) : (
                <Users className="h-8 w-8 text-gray-500" />
              )}
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              {searchTerm ? `No ${activeTab} found` : `No ${activeTab} yet`}
            </h3>
            <p className="text-gray-400 text-center max-w-sm">
              {searchTerm
                ? "Try adjusting your search terms"
                : activeTab === "chats"
                  ? "Start a new conversation to see it here"
                  : "Create or join a group to see it here"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {filteredChats.sort((a, b) => new Date(b.last_message_time) - new Date(a.last_message_time))
              .map((chat) => (
                <Link
                  key={chat.id}
                  to={chat.is_group ? `/chat/group/${chat.id}` : `/chat/${chat.other_user?.id}`}
                  onClick={() => {
                    setHighlightedChatId(null)
                    setCurrentChatroomId(chat.id)
                  }}
                  className={`
                  flex items-center p-4 transition-colors hover:bg-gray-900
                  ${highlightedChatId === chat.id ? "bg-purple-900/30" : ""}
                `}
                >
                  <div className="relative flex-shrink-0">
                    {chat.is_group ? (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center text-lg font-bold">
                        {chat.group_name?.charAt(0).toUpperCase() || "G"}
                      </div>
                    ) : chat.other_user?.profile_photo_url ? (
                      <img
                        src={chat.other_user.profile_photo_url || "/placeholder.svg"}
                        alt={`${chat.other_user.username}'s avatar`}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-700"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center border-2 border-gray-700">
                        <span className="text-white font-semibold text-lg">
                          {chat.other_user?.username?.charAt(0).toUpperCase() || "?"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white truncate">
                        {chat.is_group ? chat.group_name : chat.other_user?.username}
                      </h3>
                      {chat.last_message_time && (
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                          {new Date(chat.last_message_time).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {chat.last_message ? (
                      <p className="text-sm text-gray-400 truncate mt-1">{chat.last_message}</p>
                    ) : (
                      <p className="text-sm text-gray-500 italic mt-1">
                        {chat.is_group ? "Start group conversation" : "Start a conversation"}
                      </p>
                    )}
                  </div>
                  {chat.unread_count > 0 && (
                    <div className="ml-2 flex-shrink-0">
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full min-w-[20px] h-5">
                        {chat.unread_count > 99 ? "99+" : chat.unread_count}
                      </span>
                    </div>
                  )}
                </Link>
              ))}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Create New Group</h2>
              <button
                onClick={() => setShowGroupModal(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="space-y-4">
                {/* Group Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Enter group name"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 resize-none"
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    placeholder="What is this group about?"
                    rows={2}
                  />
                </div>

                {/* Add Members */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Add Members</label>
                  <div className="max-h-32 overflow-y-auto bg-gray-50 border border-gray-200 rounded-lg p-2">
                    {chatUsers.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-2">No users available</p>
                    ) : (
                      <div className="space-y-1">
                        {chatUsers.map((user) => (
                          <label
                            key={user.id}
                            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                          >
                            <input
                              type="checkbox"
                              value={user.id}
                              checked={selectedUserIds.includes(user.id)}
                              onChange={(e) => {
                                const id = Number.parseInt(e.target.value)
                                setSelectedUserIds((prev) =>
                                  e.target.checked ? [...prev, id] : prev.filter((uid) => uid !== id),
                                )
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            {user.avatar ? (
                              <img
                                src={user.avatar || "/placeholder.svg"}
                                alt="avatar"
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs flex items-center justify-center font-medium">
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="text-sm text-gray-900">{user.username}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Member Limit and Private */}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Member Limit</label>
                    <input
                      type="number"
                      min={2}
                      max={100}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      value={groupLimit}
                      onChange={(e) => setGroupLimit(e.target.value)}
                    />
                  </div>
                  <div className="mt-6">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={isPrivate}
                        onChange={(e) => setIsPrivate(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      Private
                    </label>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowGroupModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGroup}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatHome
