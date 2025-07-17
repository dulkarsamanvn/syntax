import axiosInstance from '@/api/axiosInstance'
import AdminSideBar from '@/Components/AdminSideBar'
import React, { useEffect, useState } from 'react'
import { Search,ChevronLeft, ChevronRight, Users } from 'lucide-react'
import Spinner from '@/Components/Spinner'

function LeaderboardManagement() {
  const [topUsers, setTopUsers] = useState([])
  const [searchQuery,setSearchQuery]=useState('')
  const [count,setCount]=useState(0)
  const [currentPage,setCurrentPage]=useState(1)
  const [loading,setLoading]=useState(false)

  const USERS_PER_PAGE=5
  const totalPages = Math.ceil(count / USERS_PER_PAGE)



  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        setLoading(true)
        const params={
            page:currentPage,
            page_size:USERS_PER_PAGE
        }
        if(searchQuery){
            params.search=searchQuery
        }
        const res = await axiosInstance.get('/leaderboard/top-users/',{params})
        setTopUsers(res.data.results || [])
        setCount(res.data.count)
      } catch (err) {
        console.error('Error fetching top users', err)
      }finally{
        setLoading(false)
      }
    }
    fetchTopUsers()
  }, [searchQuery,currentPage])

  const renderPaginationButtons = () => {
    const buttons = []

    buttons.push(
      <button
        key="prev"
        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
        disabled={currentPage === 1}
        className="px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded disabled:opacity-50"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
    )

    for (let i = 1; i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-2 rounded transition-colors ${
            currentPage === i ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-700"
          }`}
        >
          {i}
        </button>
      )
    }

    buttons.push(
      <button
        key="next"
        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded disabled:opacity-50"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    )

    return buttons
  }

  return (
    <div className="flex min-h-screen bg-slate-900">
      <AdminSideBar />
      <div className="flex-1 p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Leaderboard Management</h1>
          <p className="text-slate-400">Top users sorted by XP</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
          {loading ? (
            <Spinner />
          ) : topUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto text-slate-600 mb-4" size={48} />
              <h3 className="text-lg font-medium text-slate-300 mb-2">No users found</h3>
              <p className="text-slate-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-700/50 border-b border-slate-600">
                    <th className="text-left px-6 py-4 text-slate-300 font-medium">Rank</th>
                    <th className="text-left px-6 py-4 text-slate-300 font-medium">Username</th>
                    <th className="text-left px-6 py-4 text-slate-300 font-medium">Email</th>
                    <th className="text-left px-6 py-4 text-slate-300 font-medium">XP</th>
                  </tr>
                </thead>
                <tbody>
                  {topUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      className={`border-b border-slate-700 hover:bg-slate-700/30 transition-colors ${
                        index % 2 === 0 ? "bg-slate-800/50" : "bg-slate-800/20"
                      }`}
                    >
                      <td className="px-6 py-4 text-white">{(currentPage - 1) * USERS_PER_PAGE + index + 1}</td>
                      <td className="px-6 py-4 text-white">{user.username}</td>
                      <td className="px-6 py-4 text-slate-400">{user.email}</td>
                      <td className="px-6 py-4 text-blue-400 font-semibold">{user.xp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-8 gap-1">{renderPaginationButtons()}</div>
        )}
      </div>
    </div>
  )
}

export default LeaderboardManagement
