import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Bell, Search, BarChart3, MessageSquare } from 'lucide-react'

function ChatLayout() {
  const navigate=useNavigate()
  const handleRedirect=()=>{
    navigate('/home')
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <nav className="border-b border-slate-700/50 px-4 md:px-6 py-4 bg-slate-900/95 backdrop-blur-xl shadow-2xl sticky top-0 z-50">
        <div className="flex items-center justify-between">
          {/* Left side - Logo */}
          <button onClick={handleRedirect}>
            <div className="flex items-center">
              <img src="/images/logo_new.png" alt="SYNTAX Logo" className="h-auto w-auto" />
            </div>
          </button>
        </div>
      </nav>
      <Outlet />
    </div>
  )
}

export default ChatLayout
