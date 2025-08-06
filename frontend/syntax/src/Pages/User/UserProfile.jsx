import React, { useEffect, useState } from 'react'
import axiosInstance from '../../api/axiosInstance'
import { useLocation, useNavigate } from 'react-router-dom'
import { Search, Bell, MessageSquare, Clock, Code2, Users, Zap, Settings, BarChart3, ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"


function UserProfile() {
  const [user, setUser] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [xpHistory, setXpHistory] = useState([])
  const [earnedBadges, setEarnedBadges] = useState([])
  const [languageStats,setLanguageStats]=useState([])
  const [domainStats,setDomainStats]=useState({})
  const [current_page,setCurrentPage]=useState(1)
  const [totalPages,setTotalPages]=useState(1)

  const pageSize=10

  const navigate = useNavigate()
  const location = useLocation()

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await axiosInstance.get('/profile/', { withCredentials: true })
      console.log(res.data)
      setUser(res.data)
    } catch (err) {
      setError('Failed to load profile')
      console.error('Profile fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchBadges = async () => {
    try {
      const res = await axiosInstance.get('/badge/earned-badges/')
      setEarnedBadges(res.data)
    } catch (err) {
      console.error('error fetching badges', err)
    }
  }

  const fetchLanguageStats=async()=>{
    try{
      const res=await axiosInstance.get('/challenge/language-stats/')
      setLanguageStats(res.data)
    }catch(err){
      console.error('error fetching language stats')
    }
  }

  const fetchDomainStats=async()=>{
    try{
      const res=await axiosInstance.get('/challenge/domain-stats/')
      setDomainStats(res.data)
    }catch(err){
      console.error('error fetching domain stats')
    }
  }

  useEffect(() => {
    const fetchXpHistory = async (page=1) => {
      try {
        const res = await axiosInstance.get(`/profile/xp-history/?page=${page}&page_size=3`)
        setXpHistory(res.data.results)
        setCurrentPage(res.data.current_page)
        setTotalPages(res.data.total_pages)
      } catch (err) {
        console.error('error fetching xp history', err)
      }
    }
    fetchXpHistory(current_page)
  }, [current_page])

  const handleRedirect = () => {
    navigate('/home')
  }

  const handleSettings = () => {
    navigate('/settings/security')
  }

  useEffect(() => {

    fetchProfile()
    fetchBadges()
    fetchLanguageStats()
    fetchDomainStats()

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
                  <img
                    src='https://img.freepik.com/free-vector/cute-girl-hacker-operating-laptop-cartoon-vector-icon-illustration-people-technology-isolated-flat_138676-9487.jpg?semt=ais_hybrid&w=740'
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
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
        <button onClick={() => navigate('/edit-profile')} className="absolute bottom-6 right-6 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors">
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
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">XP Credit History</h3>
                  {xpHistory.length === 0 ? (
                    <p className="text-slate-400">No XP history found.</p>
                  ) : (
                    <div className="space-y-4">
                      {xpHistory.map((item) => (
                        <div
                          key={item.id}
                          className="bg-slate-700/50 rounded-lg p-4 shadow-sm border border-slate-600"
                        >
                          <div className="flex justify-between items-center mb-0">
                            <span className="text-green-400 font-bold text-sm">+{item.xp_awarded} XP</span>
                            <span className="text-slate-400 text-sm">
                              {item.challenge_title}
                              {/* {format(new Date(item.created_at), "PPP p")} */}
                            </span>
                          </div>
                          {/* <p className="text-slate-300 text-sm">
                            For completing: <span className="font-medium">{item.challenge_title}</span>
                          </p> */}
                        </div>
                      ))}
                    </div>
                    
                  )}
                </div>
                {totalPages > 1 && (
  <div className="flex justify-center items-center gap-4 mt-6">
    <button
      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
      disabled={current_page === 1}
      className={`p-2 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition ${
        current_page === 1 ? 'opacity-40 cursor-not-allowed' : ''
      }`}
    >
      <ChevronLeft size={20} />
    </button>

    <span className="text-sm text-white">
      Page {current_page} of {totalPages}
    </span>

    <button
      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
      disabled={current_page === totalPages}
      className={`p-2 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition ${
        current_page === totalPages ? 'opacity-40 cursor-not-allowed' : ''
      }`}
    >
      <ChevronRight size={20} />
    </button>
  </div>
)}
              </div>
            )}

            {/* Badges Card */}
            {loading ? (
              <LoadingCard />
            ) : (
              <div className="bg-slate-800 rounded-2xl p-6 text-white">
                <h3 className="text-xl font-semibold mb-4">Badges</h3>

                {earnedBadges.length === 0 ? (
                  <p className="text-slate-400">No badges earned yet.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {earnedBadges.map((badge, index) => (
                      <div key={index} className="bg-slate-700/50 rounded-xl p-4 flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-blue-600 flex items-center justify-center">
                          {badge.icon ? (
                            <img src={badge.icon} alt={badge.title} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white text-sm">🏅</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{badge.title}</h4>
                          <p className="text-slate-400 text-sm">{badge.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                    <span className="font-semibold text-white">{domainStats.challenges_completed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Acceptance Rate</span>
                    <span className="font-semibold text-white">{domainStats.acceptance_rate}%</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Easy */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-green-400 text-sm font-medium">Easy</span>
                      <span className="text-slate-400 text-sm">
                        {domainStats.easy_completed}/{domainStats.easy_total}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(domainStats.easy_completed / domainStats.easy_total) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Medium */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-orange-400 text-sm font-medium">Medium</span>
                      <span className="text-slate-400 text-sm">
                        {domainStats.medium_completed}/{domainStats.medium_total}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(domainStats.medium_completed / domainStats.medium_total) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Hard */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-red-400 text-sm font-medium">Hard</span>
                      <span className="text-slate-400 text-sm">
                        {domainStats.hard_completed}/{domainStats.hard_total}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(domainStats.hard_completed / domainStats.hard_total) * 100}%` }}
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
                  {languageStats.map((lang, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-slate-300 font-medium">{lang.language}</span>
                        <span className="text-white font-semibold">{lang.completed_count}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(lang.completed_count / 100) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile