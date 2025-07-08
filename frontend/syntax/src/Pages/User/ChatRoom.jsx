import axiosInstance from '@/api/axiosInstance'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

function ChatRoom() {
    const { userId } = useParams()
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [socket, setSocket] = useState(null)
    const [currentUserId, setCurrentUserId] = useState(null)
    const [isConnected, setIsConnected] = useState(false)
    const [error, setError] = useState(null)
    const roomIdRef = useRef()
    const navigate=useNavigate()

    // Fetch current user profile
    useEffect(() => {
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
    }, [])

    // Create WebSocket connection
    useEffect(() => {
        let newSocket = null

        const connectWebSocket = async () => {
            // Wait for currentUserId to be set
            if (!currentUserId) {
                console.log("currentUserId not set yet, skipping WebSocket connection");
                return;
            }

            try {
                setError(null)
                console.log("Creating or joining room for user:", currentUserId);
                
                const res = await axiosInstance.post('chat/create-or-get-room/', { user_id: userId })
                const roomId = res.data.room_id
                roomIdRef.current = roomId

                console.log("Connecting to WebSocket room:", roomId);

                newSocket = new WebSocket(`ws://localhost:8000/ws/chat/${roomId}/`)
                
                newSocket.onopen = () => {
                    console.log("WebSocket connected!");
                    setIsConnected(true)
                    setError(null)
                };
                
                newSocket.onmessage = (e) => {
                    console.log("Received WebSocket message:", e.data);
                    try {
                        const data = JSON.parse(e.data)
                        
                        // Check if it's an error message
                        if (data.error) {
                            console.error("Server error:", data.error);
                            setError(data.error)
                        } else {
                            // Add message to the list
                            setMessages(prev => [...prev, data])
                        }
                    } catch (err) {
                        console.error("Error parsing message:", err);
                    }
                }
                
                newSocket.onerror = (e) => {
                    console.error("WebSocket error:", e);
                    setError("WebSocket connection error")
                    setIsConnected(false)
                };

                newSocket.onclose = (e) => {
                    console.log("WebSocket closed:", e.code, e.reason);
                    setIsConnected(false)
                    if (e.code !== 1000) {
                        setError("WebSocket connection closed unexpectedly")
                    }
                };

                setSocket(newSocket)
            } catch (error) {
                console.error("Error creating room or connecting to WebSocket:", error);
                setError("Failed to connect to chat room")
            }
        }

        connectWebSocket()

        return () => {
            if (newSocket && newSocket.readyState === WebSocket.OPEN) {
                console.log("Closing WebSocket connection");
                newSocket.close(1000, "Component unmounting")
            }
        }
    }, [userId, currentUserId])

    const sendMessage = () => {

        if (currentUserId === null) {
            console.log("currentUserId is null, cannot send.");
            setError("User not authenticated")
            return;
        }

        if (!input.trim()) {
            console.log("Message is empty");
            return;
        }

        const messageData = { 
            message: input.trim(), 
            sender_id: currentUserId 
        }
        
        console.log("Sending message via WebSocket:", messageData);
        
        try {
            socket.send(JSON.stringify(messageData))
            setInput('')
            setError(null)
            console.log("Message sent successfully");
        } catch (err) {
            console.error("Error sending message:", err);
            setError("Failed to send message")
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            sendMessage()
        }
    }

    return (
        <div className="p-4">
            <button onClick={()=>navigate(-1)}>back</button>
            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    Error: {error}
                </div>
            )}

            <div className="h-96 overflow-y-scroll bg-gray-800 text-white p-4 rounded">
                {messages.length === 0 ? (
                    <div className="text-gray-400 text-center">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div key={index} className={`my-2 ${msg.sender_id == currentUserId ? "text-right" : "text-left"}`}>
                            <div className={`inline-block p-2 rounded ${
                                msg.sender_id == currentUserId 
                                    ? "bg-blue-600 text-white" 
                                    : "bg-gray-600 text-white"
                            }`}>
                                {msg.message}
                            </div>
                            {msg.timestamp && (
                                <div className="text-xs text-gray-400 mt-1">
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            <div className="flex mt-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 p-2 rounded-l bg-gray-100 text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type a message..."
                    disabled={!isConnected}
                />
                <button 
                    onClick={sendMessage} 
                    className="px-4 bg-blue-600 text-white rounded-r hover:bg-blue-700 disabled:bg-gray-400"
                    disabled={!isConnected || !input.trim()}
                >
                    Send
                </button>
            </div>
        </div>
    )
}

export default ChatRoom