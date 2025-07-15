import axiosInstance from "@/api/axiosInstance"
import {
  Search,
  Bell,
  MessageSquare,
  Award,
  Users,
  Trophy,
  Eye,
  Code,
  Zap,
  Shield,
  Sparkles,
  ArrowRight,
  CircleCheck
} from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Home() {
  const [userProfile, setUserProfile] = useState({
    username: "",
    profile_photo_url: "",
    level: "",
    xp: 0,
    xp_for_next_level: 500,
    rank: 1,
  })
  const [challenges, setChallenges] = useState([])
  const [isPremium,setIsPremium]=useState(false)
  const navigate = useNavigate()

  const handleProfile = () => {
    navigate("/profile")
  }

  useEffect(()=>{
    const fetchSubscription=async()=>{
      try{
        const res=await axiosInstance.get('/premium/check-subscription/')
        setIsPremium(res.data.is_premium)
      }catch(err){
        console.error('error fetching subscription',err)
      }
    }

    fetchSubscription()
  },[])

  useEffect(() => {
    const fetch_profile = async () => {
      try {
        const response = await axiosInstance.get("/profile/", { withCredentials: true })
        setUserProfile({
          username: response.data.username,
          profile_photo_url: response.data.profile_photo_url,
          level: response.data.level,
          xp: response.data.xp,
          xp_for_next_level: response.data.xp_for_next_level,
          rank: response.data.rank,
        })
      } catch (error) {
        console.error("Failed to fetch user profile:", error)
      }
    }

    const fetchChallenges = async () => {
      try {
        const res = await axiosInstance.get("/challenge/list/")
        setChallenges(res.data.results)
      } catch (err) {
        console.error("error fetching challenges", err)
      }
    }

    fetch_profile()
    fetchChallenges()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      {/* Top Navigation Bar */}
      <nav className="border-b border-slate-700/50 px-4 md:px-6 py-4 bg-slate-900/95 backdrop-blur-xl shadow-2xl sticky top-0 z-50">
        <div className="flex items-center justify-between">
          {/* Left side - Logo */}
          <div className="flex items-center">
            <img
              src="/images/logo_new.png"
              alt="SYNTAX Logo"
              className="h-auto w-auto transition-transform hover:scale-105"
            />
          </div>

          {/* Center - Search (hidden on mobile) */}
          <div className="hidden md:flex flex-1 justify-center px-8">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search domains..."
                className="w-full bg-slate-800/80 border border-slate-600/50 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 hover:bg-slate-700/80"
              />
            </div>
          </div>

          {/* Right side - Notifications and Profile */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Mobile search button */}
            <button className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200">
              <Search className="w-5 h-5" />
            </button>
            <button onClick={()=>navigate('/leaderboard')} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200" title="leaderboard">
              <Award className="w-5 h-5" />
            </button>
            <button onClick={()=>navigate('/chat')} className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200" title="chat">
              <MessageSquare className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-xs rounded-full w-4 h-4 flex items-center justify-center shadow-lg animate-pulse">
                2
              </span>
            </button>
            <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-500 to-blue-600 text-xs rounded-full w-4 h-4 flex items-center justify-center shadow-lg animate-pulse">
                1
              </span>
            </button>
            <button onClick={handleProfile} className="hover:bg-slate-800 rounded-lg p-1 transition-all duration-200">
              <div className="flex items-center space-x-2">
                {userProfile.profile_photo_url ? (
                  <img
                    src={userProfile.profile_photo_url || "/placeholder.svg"}
                    alt="Profile"
                    className="w-8 h-8 rounded-full ring-2 ring-blue-500/50 hover:ring-blue-400 transition-all duration-200"
                  />
                ) : (
                  <img
                    src="https://img.freepik.com/free-vector/cute-girl-hacker-operating-laptop-cartoon-vector-icon-illustration-people-technology-isolated-flat_138676-9487.jpg?semt=ais_hybrid&w=740"
                    alt="Profile"
                    className="w-8 h-8 rounded-full ring-2 ring-blue-500/50 hover:ring-blue-400 transition-all duration-200"
                  />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search domains..."
              className="w-full bg-slate-800/80 border border-slate-600/50 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
            />
          </div>
        </div>
      </nav>

      {/* Level Bar Section */}
      <div className="px-4 md:px-6 py-4 mx-6 mt-6 bg-gradient-to-r from-slate-800/80 via-slate-700/60 to-slate-800/80 border border-slate-600/30 rounded-2xl shadow-2xl backdrop-blur-sm">
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-lg shadow-lg">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
              Level {userProfile.level}
            </span>
          </div>
          <div className="flex-1">
            <div className="w-full bg-slate-700/50 rounded-full h-3 shadow-inner">
              <div
                className="bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 h-3 rounded-full shadow-lg transition-all duration-500 ease-out relative overflow-hidden"
                style={{
                  width: `${userProfile.xp && userProfile.xp_for_next_level ? (userProfile.xp / userProfile.xp_for_next_level) * 100 : 0}%`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              </div>
            </div>
          </div>
          <span className="text-sm md:text-base text-slate-300 font-medium">
            {userProfile.xp} / {userProfile.xp_for_next_level || 500}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        <main className="flex-1 p-4 md:p-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Featured Challenge */}
            <div>
              <div className="bg-gradient-to-br from-slate-800/90 via-slate-700/80 to-slate-800/90 rounded-2xl p-6 md:p-8 mb-8 border border-slate-600/30 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-blue-600/10"></div>
                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-6">
                    <span className="bg-gradient-to-r from-purple-600 to-purple-700 text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg flex items-center space-x-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Limited Time</span>
                    </span>
                    <span className="bg-gradient-to-r from-red-600 to-red-700 text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg">
                      HARD
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
                    ZigZag Conventions
                  </h2>
                  <p className="text-base md:text-lg text-slate-300 mb-6 leading-relaxed">
                    Descend into the depths of corrupted code fragments. Repair the digital ecosystem before the
                    instability spreads to critical systems.
                  </p>
                  <div className="flex items-center space-x-6 text-base text-slate-400 mb-6">
                    <span className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>60 min</span>
                    </span>
                    <span className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>18% success rate</span>
                    </span>
                  </div>
                  <button className="group bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 hover:from-blue-500 hover:via-blue-600 hover:to-cyan-500 px-8 py-4 rounded-xl font-semibold shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-blue-500/25 flex items-center space-x-3">
                    <span className="text-base">Enter Domain</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </button>
                </div>
              </div>

              {/* Filter Tags */}
              <div className="flex flex-wrap gap-3 mb-8">
                {["All", "JavaScript", "Python", "Algorithm", "Network", "Database", "Shell"].map((tag, index) => (
                  <button
                    key={tag}
                    className={`px-4 md:px-6 py-2.5 rounded-full text-sm md:text-base font-medium transition-all duration-200 ${index === 0
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25 transform scale-105"
                      : "bg-slate-700/80 text-slate-300 hover:bg-slate-600/80 hover:text-white hover:shadow-lg hover:scale-105 border border-slate-600/50"
                      }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Available Challenges */}
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Available Challenges
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {challenges.map((challenge, index) => (
                    <div
                      key={index}
                      className="relative group bg-gradient-to-br from-slate-800/90 to-slate-700/80 rounded-xl p-6 border border-slate-600/30 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:border-slate-500/50 backdrop-blur-sm"
                    >



                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-xs px-3 py-1.5 rounded-full font-semibold shadow-md ${challenge.difficulty === "easy"
                              ? "bg-gradient-to-r from-teal-600 to-teal-700"
                              : challenge.difficulty === "medium"
                                ? "bg-gradient-to-r from-yellow-600 to-orange-600"
                                : "bg-gradient-to-r from-red-600 to-red-700"
                              }`}
                          >
                            {challenge.difficulty?.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 mt-3 rounded-lg">
                          {challenge.time_limit} Minutes
                        </span>
                      </div>

                      <h4 className="font-bold mb-3 text-lg text-white group-hover:text-blue-300 transition-colors duration-200">
                        {challenge.title}
                      </h4>

                      {/* {challenge.is_completed && (
                        <div className="inline-block mb-3 px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs rounded-full font-medium shadow-md">
                          Completed
                        </div>
                      )} */}
                      {challenge.is_completed && (
                        <div className="absolute -top-2 -right-2 px-3 py-1 bg-gray-700 text-green-400 text-xs rounded-full font-medium shadow-md z-10 flex items-center space-x-1.5 border border-gray-600">
                          <span className="text-white">Solved</span>
                          <div className="flex items-center justify-center w-4 h-4  rounded-full">
                            <CircleCheck className="w-5 h-3.5 text-green" strokeWidth={3} />
                          </div>
                        </div>
                      )}

                      <p className="text-sm text-slate-400 mb-4 line-clamp-2 leading-relaxed truncate overflow-hidden whitespace-nowrap">
                        {challenge.description}
                      </p>

                      <div className="flex items-center justify-between text-sm text-slate-400 mb-6">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4" />
                            <span>{challenge.completed_users}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{challenge.success_rate}%</span>
                          <div className="w-12 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                              style={{ width: `${challenge.success_rate}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if(challenge.is_premium && !isPremium){
                            navigate('/premium')
                          }else{
                            navigate(`/challenge/${challenge.id}`)
                          }
                        }}
                        className={`group/btn w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 transition-all duration-300 transform hover:scale-105 shadow-lg ${challenge.is_premium
                          ? "bg-gradient-to-r from-orange-600 via-orange-700 to-red-600 hover:from-orange-500 hover:via-orange-600 hover:to-red-500 hover:shadow-orange-500/25"
                          : "bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 hover:from-blue-500 hover:via-blue-600 hover:to-cyan-500 hover:shadow-blue-500/25"
                          }`}
                      >
                        <Code className="w-4 h-4 group-hover/btn:rotate-12 transition-transform duration-200" />
                        <span>{challenge.is_premium ? "Premium Domain" : "Enter Domain"}</span>
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Premium Features */}
              <div className="bg-gradient-to-br from-slate-800/90 via-purple-900/20 to-slate-800/90 rounded-2xl p-8 mt-12 border border-slate-600/30 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-orange-600/5"></div>
                <div className="relative z-10">
                  <h3 className="text-3xl font-bold mb-3 text-center bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                    Unlock Premium Features
                  </h3>
                  <p className="text-lg text-slate-300 text-center mb-8 leading-relaxed">
                    Get unlimited access to advanced challenges, exclusive content, and priority support
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div className="text-center group">
                      <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-200">
                        <Zap className="w-8 h-8 text-white mx-auto" />
                      </div>
                      <h4 className="font-bold mb-2 text-lg">Gain More XP</h4>
                      <p className="text-sm text-slate-400">2x faster level ups</p>
                    </div>
                    <div className="text-center group">
                      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-200">
                        <Eye className="w-8 h-8 text-white mx-auto" />
                      </div>
                      <h4 className="font-bold mb-2 text-lg">Solution Hints</h4>
                      <p className="text-sm text-slate-400">Get hints when you're stuck</p>
                    </div>
                    <div className="text-center group">
                      <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-200">
                        <Shield className="w-8 h-8 text-white mx-auto" />
                      </div>
                      <h4 className="font-bold mb-2 text-lg">Exclusive Domains</h4>
                      <p className="text-sm text-slate-400">Access premium-only challenges</p>
                    </div>
                  </div>

                  <div className="text-center">
                    <button onClick={()=>navigate('/premium')} className="group bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-500 hover:via-pink-500 hover:to-orange-500 px-10 py-4 rounded-xl font-bold text-lg shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-purple-500/25 flex items-center space-x-3 mx-auto">
                      <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
                      <span>Upgrade To Premium</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Groups */}
              <div className="mt-12">
                <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Active Groups
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { name: "Javascript Masters", members: 245, online: 12 },
                    { name: "Python Enthusiasts", members: 245, online: 12 },
                    { name: "Algorithm Study Group", members: 245, online: 12 },
                    { name: "Data Structures Deep Dive", members: 245, online: 12 },
                  ].map((group, index) => (
                    <div
                      key={index}
                      className="group bg-gradient-to-br from-slate-800/90 to-slate-700/80 rounded-xl p-6 border border-slate-600/30 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-lg group-hover:text-blue-300 transition-colors duration-200">
                          {group.name}
                        </h4>
                        <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-lg animate-pulse"></div>
                      </div>
                      <p className="text-base text-slate-400 mb-6">
                        {group.members} Members •{" "}
                        <span className="text-green-400 font-medium">{group.online} Online</span>
                      </p>
                      <button className="group/btn bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 px-6 py-3 rounded-xl text-sm font-semibold w-full shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-blue-500/25 flex items-center justify-center space-x-2">
                        <MessageSquare className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-200" />
                        <span>Join Chat</span>
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
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
