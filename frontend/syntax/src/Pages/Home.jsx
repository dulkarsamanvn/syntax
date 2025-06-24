import axiosInstance from "@/api/axiosInstance"
import { Search, Bell, MessageSquare, Users, Trophy, Eye, Heart, Code, Zap, Shield, BarChart3 } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Home() {

  const [userProfile,setUserProfile]=useState({
    username:'',
    profile_photo_url:'',
    level:'',
    xp:0,
    xp_for_next_level: 500,
    rank:1
  })

  const navigate=useNavigate()
  const handleProfile = () => {
    navigate('/profile')
  }



  useEffect(()=>{
    const fetch_profile=async()=>{
      try{
        const response=await axiosInstance.get('/profile/',{withCredentials:true})
        setUserProfile({
          username:response.data.username,
          profile_photo_url:response.data.profile_photo_url,
          level:response.data.level,
          xp:response.data.xp,
          xp_for_next_level: response.data.xp_for_next_level,
          rank:response.data.rank
        })

      }catch(error){
        console.error('Failed to fetch user profile:', error)
      }
    }

    fetch_profile()
  },[])

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      {/* Top Navigation Bar */}
      <nav className="border-b border-slate-700/50 px-4 md:px-6 py-4 bg-slate-900/90 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          {/* Left side - Logo */}
          <div className="flex items-center">
            <img src="/images/logo_new.png" alt="SYNTAX Logo" className="h-auto w-auto" />
          </div>

          {/* Center - Search (hidden on mobile) */}
          <div className="hidden md:flex flex-1 justify-center px-8">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search domains..."
                className="w-full bg-slate-800/80 border border-slate-600/50 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Right side - Notifications and Profile */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Mobile search button */}
            <button className="md:hidden p-2 text-slate-400 hover:text-white">
              <Search className="w-5 h-5" />
            </button>

            <button className="p-2 text-slate-400 hover:text-white">
              <BarChart3 className="w-5 h-5" />
            </button>
            <button className="relative p-2 text-slate-400 hover:text-white">
              <MessageSquare className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full w-4 h-4 flex items-center justify-center">
                2
              </span>
            </button>
            <button className="relative p-2 text-slate-400 hover:text-white">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-blue-500 text-xs rounded-full w-4 h-4 flex items-center justify-center">
                1
              </span>
            </button>
            <button onClick={handleProfile}>
              <div className="flex items-center space-x-2">
                <img src={userProfile.profile_photo_url} alt="Profile" className="w-8 h-8 rounded-full" />
                {/* <div className="hidden sm:block text-left"> */}
                  {/* <div className="text-base font-medium">Saman</div> */}
                  {/* <div className="text-sm text-slate-400">Rank 15</div> */}
                {/* </div> */}
              </div>
            </button>
          </div>
        </div>

        {/* Mobile search bar (shown when search button is clicked) */}
        <div className="md:hidden mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search domains..."
              className="w-full bg-slate-800/80 border border-slate-600/50 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
          </div>
        </div>
      </nav>

      {/* Level Bar Section */}
      <div className="px-4 md:px-6 py-4 bg-slate-800/60 border-b border-slate-700/50 mt-5 ml-6 mr-6 rounded-full">
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="text-lg md:text-xl font-semibold">Level {userProfile.level}</span>
          </div>
          <div className="flex-1">
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-400 to-cyan-400 h-2 rounded-full"
                style={{ width: `${userProfile.xp && userProfile.xp_for_next_level ? (userProfile.xp / userProfile.xp_for_next_level) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          <span className="text-sm md:text-base text-slate-400">{userProfile.xp} / {userProfile.xp_for_next_level || 500}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        <main className="flex-1 p-4 md:p-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Featured Challenge */}
            <div>
              <div className="bg-slate-800/80 rounded-lg p-4 md:p-6 mb-6 border border-slate-700/30">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="bg-purple-600 text-xs px-2 py-1 rounded">Limited Time</span>
                  <span className="bg-red-600 text-xs px-2 py-1 rounded">HARD</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">ZigZag Conventions</h2>
                <p className="text-base md:text-lg text-slate-400 mb-4">
                  Descend into the depths of corrupted code fragments. Repair the digital ecosystem before the
                  instability spreads to critical systems.
                </p>
                <div className="flex items-center space-x-4 md:space-x-6 text-sm md:text-base text-slate-400 mb-4">
                  <span>60 min</span>
                  <span>18% success rate</span>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 px-4 md:px-6 py-2 rounded-lg flex items-center space-x-2">
                  <span>Enter Domain</span>
                  <Code className="w-4 h-4" />
                </button>
              </div>

              {/* Filter Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {["All", "JavaScript", "Python", "Algorithm", "Network", "Database", "Shell"].map((tag, index) => (
                  <button
                    key={tag}
                    className={`px-3 md:px-4 py-2 rounded-full text-sm md:text-base ${
                      index === 0 ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Available Challenges */}
              <div>
                <h3 className="text-xl md:text-2xl font-semibold mb-4">Available Challenges</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      title: "Syntax Labyrinth",
                      difficulty: "EASY",
                      time: "20 min",
                      participants: 342,
                      likes: 15,
                      completion: 64,
                      popular: true,
                    },
                    {
                      title: "Syntax Labyrinth",
                      difficulty: "MEDIUM",
                      time: "20 min",
                      participants: 342,
                      likes: 15,
                      completion: 64,
                    },
                    {
                      title: "Syntax Labyrinth",
                      difficulty: "EASY",
                      time: "20 min",
                      participants: 342,
                      likes: 15,
                      completion: 64,
                      popular: true,
                    },
                    {
                      title: "Syntax Labyrinth",
                      difficulty: "HARD",
                      time: "20 min",
                      participants: 342,
                      likes: 15,
                      completion: 64,
                    },
                    {
                      title: "Syntax Labyrinth",
                      difficulty: "HARD",
                      time: "20 min",
                      participants: 342,
                      likes: 15,
                      completion: 64,
                      premium: true,
                    },
                    {
                      title: "Two Sum",
                      difficulty: "MEDIUM",
                      time: "20 min",
                      participants: 342,
                      likes: 15,
                      completion: 64,
                    },
                    {
                      title: "Array Manipulation",
                      difficulty: "EASY",
                      time: "15 min",
                      participants: 567,
                      likes: 23,
                      completion: 78,
                    },
                    {
                      title: "Dynamic Programming",
                      difficulty: "HARD",
                      time: "45 min",
                      participants: 189,
                      likes: 8,
                      completion: 32,
                      premium: true,
                    },
                  ].map((challenge, index) => (
                    <div key={index} className="bg-slate-800/70 rounded-lg p-6 border border-slate-700/30">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {challenge.popular && (
                            <span className="bg-purple-600 text-xs px-2 py-1 rounded">Popular</span>
                          )}
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              challenge.difficulty === "EASY"
                                ? "bg-green-600"
                                : challenge.difficulty === "MEDIUM"
                                  ? "bg-yellow-600"
                                  : "bg-red-600"
                            }`}
                          >
                            {challenge.difficulty}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">{challenge.time}</span>
                      </div>
                      <h4 className="font-semibold mb-2 text-base">{challenge.title}</h4>
                      <p className="text-sm text-slate-400 mb-4">Navigate through a maze of broken code.</p>
                      <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>{challenge.participants}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Heart className="w-3 h-3" />
                            <span>{challenge.likes}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span>{challenge.completion}%</span>
                          <div className="w-8 h-1 bg-slate-700 rounded">
                            <div
                              className="h-1 bg-green-500 rounded"
                              style={{ width: `${challenge.completion}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <button
                        className={`w-full py-2 rounded-lg text-sm flex items-center justify-center space-x-2 ${
                          challenge.premium ? "bg-orange-600 hover:bg-orange-700" : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        <Code className="w-3 h-3" />
                        <span>{challenge.premium ? "Premium Domain" : "Enter Domain"}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Premium Features */}
              <div className="bg-slate-800/80 rounded-lg p-6 mt-8 border border-slate-700/30">
                <h3 className="text-2xl font-semibold mb-2 text-center">Unlock Premium Features</h3>
                <p className="text-base text-slate-400 text-center mb-6">
                  Get unlimited access to advanced challenges, exclusive content, and priority support
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <h4 className="font-semibold mb-1">Gain More XP</h4>
                    <p className="text-sm text-slate-400">2x faster level ups</p>
                  </div>
                  <div className="text-center">
                    <Eye className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <h4 className="font-semibold mb-1">Solution Hints</h4>
                    <p className="text-sm text-slate-400">Get hints when you're stuck</p>
                  </div>
                  <div className="text-center">
                    <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <h4 className="font-semibold mb-1">Exclusive Domains</h4>
                    <p className="text-sm text-slate-400">Access premium-only challenges</p>
                  </div>
                </div>
                <div className="text-center">
                  <button className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-lg font-semibold">
                    Upgrade To Premium
                  </button>
                </div>
              </div>

              {/* Active Groups */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Active Groups</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: "Javascript Masters", members: 245, online: 12 },
                    { name: "Python Enthusiasts", members: 245, online: 12 },
                    { name: "Algorithm Study Group", members: 245, online: 12 },
                    { name: "Data Structures Deep Dive", members: 245, online: 12 },
                  ].map((group, index) => (
                    <div key={index} className="bg-slate-800/70 rounded-lg p-4 border border-slate-700/30">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-base">{group.name}</h4>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <p className="text-base text-slate-400 mb-4">
                        {group.members} Members • {group.online} Online
                      </p>
                      <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm w-full">
                        Join Chat
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
