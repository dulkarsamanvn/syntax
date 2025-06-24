import React, { useEffect, useState } from 'react'
import axiosInstance from '../api/axiosInstance'
import { useLocation, useNavigate } from 'react-router-dom'
import { Search, Bell, MessageSquare, Clock, Code2, Users, Zap, Settings, BarChart3 } from "lucide-react"

function UserProfile() {
  const [user, setUser] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const navigate = useNavigate()
  const location=useLocation()

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await axiosInstance.get('/profile/', { withCredentials: true })
      console.log(res.data)
      console.log('profile photo',res.data.profile_photo_url)
      setUser(res.data)
    } catch (err) {
      setError('Failed to load profile')
      console.error('Profile fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRedirect = () => {
    navigate('/home')
  }

  const handleSettings = () => {
    navigate('/settings')
  }

  useEffect(() => {
    fetchProfile()
    
  }, [location.state?.refresh])

  // Default values to prevent layout shifts
  const userData = {
    level: user.level || 0,
    xp: user.xp || 0,
    currentLevelXp: 350,
    nextLevelXp: user.xp_for_next_level || 500,
    challengesCompleted: 247,
    acceptanceRate: 89.2,
    easyCompleted: 142,
    easyTotal: 677,
    mediumCompleted: 89,
    mediumTotal: 122,
    hardCompleted: 11,
    hardTotal: 234,
  }

  const badges = [
    {
      icon: Clock,
      title: "Fast Solver",
      description: "Solved 10 challenges in under 5 minutes each",
      color: "bg-blue-600",
    },
    {
      icon: Code2,
      title: "Debugging Master",
      description: "Fixed 50 bugs across various challenges",
      color: "bg-blue-600",
    },
    {
      icon: Zap,
      title: "Elite Coder",
      description: "Solved 10+ challenges Without Hint",
      color: "bg-blue-600",
    },
    {
      icon: Users,
      title: "Social Collaborator",
      description: "Helped 20+ Members solve challenges",
      color: "bg-blue-600",
    },
  ]

  const languages = [
    { name: "Python", progress: 12, maxProgress: 150 },
    { name: "Python 3", progress: 127, maxProgress: 150 },
    { name: "Javascript", progress: 44, maxProgress: 150 },
  ]

  const recentActivity = [
    { name: "Longest SubString", time: "2 hours ago" },
    { name: "Two Sum", time: "1 day ago" },
    { name: "Remove nth node from linked list", time: "3 days ago" },
  ]

  // Loading component
  const LoadingCard = ({ className = "" }) => (
    <div className={`bg-slate-800 rounded-2xl p-6 ${className}`}>
      <div className="animate-pulse">
        <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-slate-700 rounded w-full"></div>
          <div className="h-4 bg-slate-700 rounded w-2/3"></div>
          <div className="h-4 bg-slate-700 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  )

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Error Loading Profile</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <button 
            onClick={fetchProfile}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      {/* Top Navigation Bar */}
      <nav className="border-b border-slate-700/50 px-4 md:px-6 py-4 bg-slate-900/90 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          {/* Left side - Logo */}
          <button onClick={handleRedirect}>
            <div className="flex items-center">
              <img src="/images/logo_new.png" alt="SYNTAX Logo" className="h-auto w-auto" />
            </div>
          </button>

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
            <button>
              {/* <div className="flex items-center space-x-2">
                <img src={user.profile_photo_url} alt="Profile" className="w-8 h-8 rounded-full" />
                <div className="hidden sm:block text-left">
                  <div className="text-base font-medium">
                    {loading ? (
                      <div className="h-4 bg-slate-700 rounded w-16 animate-pulse"></div>
                    ) : (
                      user.username || 'Saman'
                    )}
                  </div>
                  <div className="text-sm text-slate-400">
                    {loading ? (
                      <div className="h-3 bg-slate-700 rounded w-12 animate-pulse"></div>
                    ) : (
                      `Rank ${user.rank || '15'}`
                    )}
                  </div>
                </div>
              </div> */}
            </button>
          </div>
        </div>
      </nav>

      {/* Profile Header */}
      <div className="relative bg-gradient-to-r from-[#0B2447] to-[#19376D] min-h-[200px] flex items-center px-8">
        {/* Settings Button */}
        <button onClick={handleSettings} className="absolute top-6 right-6 p-2 bg-gray-900 rounded-full hover:bg-gray-800 transition-colors">
          <Settings className="w-5 h-5 text-white" />
        </button>

        {/* Profile Content */}
        <div className="flex items-center gap-6">
          {/* Avatar with Badge */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 p-1">
              <div className="w-full h-full rounded-full bg-teal-500 flex items-center justify-center overflow-hidden">
                {user.profile_photo ? (
                  <img
                    src={user.profile_photo_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-4xl">🧙‍♂️</div>
                )}
              </div>
            </div>

            {/* Badge */}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white">
              {loading ? (
                <div className="w-3 h-3 bg-blue-400 rounded animate-pulse"></div>
              ) : (
                <span className="text-white text-xs font-bold">{user.level || 0}</span>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="text-white">
            <div className="flex items-center gap-2 mb-2">
              {loading ? (
                <div className="h-8 bg-slate-700 rounded w-32 animate-pulse"></div>
              ) : (
                <h1 className="text-3xl font-bold">{user.username || 'Loading...'}</h1>
              )}
              <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-yellow-800 text-sm">⭐</span>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-gray-200">Rank</span>
                {loading ? (
                  <div className="h-4 bg-slate-700 rounded w-8 animate-pulse"></div>
                ) : (
                  <span className="font-semibold">{user.rank || '-'}</span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-yellow-400" />
                {loading ? (
                  <div className="h-4 bg-slate-700 rounded w-16 animate-pulse"></div>
                ) : (
                  <span className="font-semibold">{user.current_streak || 0} day streak</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Button */}
        <button onClick={()=>navigate('/edit-profile')} className="absolute bottom-6 right-6 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors">
          Edit Profile
        </button>
      </div>

      {/* Main Content */}
      <div className='p-10'>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Level Progress Card */}
            {loading ? (
              <LoadingCard />
            ) : (
              <div className="bg-slate-800 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Level {user.level || 0}</h3>
                  <span className="text-blue-400 font-semibold">{user.xp || 0} XP</span>
                </div>

                <div className="mb-3">
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${user.xp && user.xp_for_next_level ? (user.xp / user.xp_for_next_level) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <p className="text-slate-400 text-sm">
                  {user.xp || 0} / {user.xp_for_next_level || 500} XP to Level {(user.level || 0) + 1}
                </p>
              </div>
            )}

            {/* Badges Card */}
            {loading ? (
              <LoadingCard />
            ) : (
              <div className="bg-slate-800 rounded-2xl p-6 text-white">
                <h3 className="text-xl font-semibold mb-4">Badges</h3>
                <div className="grid grid-cols-1 gap-4">
                  {badges.map((badge, index) => {
                    const IconComponent = badge.icon
                    return (
                      <div key={index} className="bg-slate-700/50 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <div className={`${badge.color} rounded-lg p-2 flex-shrink-0`}>
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-white mb-1">{badge.title}</h4>
                            <p className="text-slate-400 text-sm leading-relaxed">{badge.description}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Domain Stats Card */}
            {loading ? (
              <LoadingCard />
            ) : (
              <div className="bg-slate-800 rounded-2xl p-6 text-white">
                <h3 className="text-xl font-semibold mb-6">Domain Stats</h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Challenges Completed</span>
                    <span className="font-semibold text-white">{userData.challengesCompleted}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Acceptance Rate</span>
                    <span className="font-semibold text-white">{userData.acceptanceRate}%</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Easy */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-green-400 text-sm font-medium">Easy</span>
                      <span className="text-slate-400 text-sm">
                        {userData.easyCompleted}/{userData.easyTotal}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(userData.easyCompleted / userData.easyTotal) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Medium */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-orange-400 text-sm font-medium">Medium</span>
                      <span className="text-slate-400 text-sm">
                        {userData.mediumCompleted}/{userData.mediumTotal}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(userData.mediumCompleted / userData.mediumTotal) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Hard */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-red-400 text-sm font-medium">Hard</span>
                      <span className="text-slate-400 text-sm">
                        {userData.hardCompleted}/{userData.hardTotal}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(userData.hardCompleted / userData.hardTotal) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Languages Card */}
            {loading ? (
              <LoadingCard />
            ) : (
              <div className="bg-slate-800 rounded-2xl p-6 text-white">
                <h3 className="text-xl font-semibold mb-6">Languages</h3>
                <div className="space-y-6">
                  {languages.map((language, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-slate-300 font-medium">{language.name}</span>
                        <span className="text-white font-semibold">{language.progress}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(language.progress / language.maxProgress) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recent Activity Card - Full Width */}
          {loading ? (
            <div className="mt-6">
              <LoadingCard />
            </div>
          ) : (
            <div className="mt-6 bg-slate-800 rounded-2xl p-6 text-white">
              <h3 className="text-xl font-semibold mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-3 border-b border-slate-700/50 last:border-b-0"
                  >
                    <span className="text-slate-300">{activity.name}</span>
                    <span className="text-slate-500 text-sm">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserProfile