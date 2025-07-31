import axiosInstance from '@/api/axiosInstance'
import React, { useEffect, useState } from 'react'
import { Award, MessageSquare, Bell, Search, Trophy, Medal, Crown, Zap, Flame, ChevronLeft, ChevronRight, X, Shield, MessageCircle, CircleAlert } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Spinner from '@/Components/Spinner'
import ReportModal from '@/Components/ReportModal'
import {useDebounce} from 'use-debounce'

function LeaderBoard() {
    const [users, setUsers] = useState([])
    const [filteredUsers, setFilteredUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [count, setCount] = useState(0)
    const [topUsers, setTopUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState(null)
    const [showModal, setShowModal] = useState(null)
    const [currentUserId, setCurrentUserId] = useState(null)
    const [showReportModal, setShowReportModal] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearchTerm]=useDebounce(searchTerm,500)
    const navigate = useNavigate()

    const USERS_PER_PAGE = 10

    useEffect(() => {
        setLoading(true)
        const fetchLeaderboard = async () => {
            try {
                const res = await axiosInstance.get('/leaderboard/', {
                    params: {
                        page: currentPage,
                        page_size: USERS_PER_PAGE,
                        search: debouncedSearchTerm
                    }
                })
                setTopUsers(res.data.top_users)
                setFilteredUsers(res.data.results || [])
                setCount(res.data.count)
                setCurrentUserId(res.data.current_user_id)
                setLoading(false)
            } catch (err) {
                console.error("error fetching leaderboard", err)
            } finally {
                setTimeout(() => {
                    setLoading(false)
                }, 2000);
            }
        }

        fetchLeaderboard()
    }, [currentPage, debouncedSearchTerm])

    const total_pages = Math.ceil(count / USERS_PER_PAGE)

    useEffect(() => {
        setCurrentPage(1)
    }, [debouncedSearchTerm])


    const getRankIcon = (index) => {
        const globalIndex = (currentPage - 1) * USERS_PER_PAGE + index
        switch (globalIndex) {
            case 0:
                return <Crown className="w-6 h-6 text-yellow-400" />
            case 1:
                return <Medal className="w-6 h-6 text-gray-400" />
            case 2:
                return <Trophy className="w-6 h-6 text-amber-600" />
            default:
                return <span className="text-lg font-bold text-slate-400">#{globalIndex + 1}</span>
        }
    }

    const renderPaginationButtons = () => {
        const buttons = []
        const maxVisiblePages = 5

        // Previous button
        buttons.push(
            <button
                key="prev"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>,
        )

        // Page numbers
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
        const endPage = Math.min(total_pages, startPage + maxVisiblePages - 1)

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1)
        }

        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`px-3 py-2 rounded-lg transition-colors ${currentPage === i ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-700"
                        }`}
                >
                    {i}
                </button>,
            )
        }

        // Show ellipsis and last page if needed
        if (endPage < total_pages) {
            if (endPage < total_pages - 1) {
                buttons.push(
                    <span key="ellipsis" className="px-3 py-2 text-slate-400">
                        ...
                    </span>,
                )
            }

            buttons.push(
                <button
                    key={total_pages}
                    onClick={() => setCurrentPage(total_pages)}
                    className="px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                    {total_pages}
                </button>,
            )
        }

        // Next button
        buttons.push(
            <button
                key="next"
                onClick={() => setCurrentPage((prev) => Math.min(total_pages, prev + 1))}
                disabled={currentPage === total_pages}
                className="px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronRight className="w-4 h-4" />
            </button>,
        )

        return buttons
    }

    const openUserModal = (user) => {
        setSelectedUser(user)
        setShowModal(true)
    }

    const closeUserModal = () => {
        setSelectedUser(null)
        setShowModal(false)
    }

    const handleMessage = (userId) => {
        navigate(`/chat/${userId}`)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
            <nav className="border-b border-slate-700/50 px-4 md:px-6 py-4 bg-slate-900/95 backdrop-blur-xl shadow-2xl sticky top-0 z-50">
                <div className="flex items-center justify-between">
                    <button onClick={() => navigate('/home')}>
                        <div className="flex items-center">
                            <img src="/images/logo_new.png" alt="SYNTAX Logo" className="h-auto w-auto transition-transform hover:scale-105" />
                        </div>
                    </button>
                </div>
            </nav>
            {loading ? (
                <Spinner />
            ) : (
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">

                    <div className="text-center mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                            Leaderboard
                        </h1>
                        <p className="text-slate-400 text-lg">Compete with the best developers and climb the ranks!</p>
                    </div>


                    <div className="flex justify-center mb-8">
                        <div className="relative w-full max-w-md">
                            <Search className=' absolute left-3 top-4 w-5 h-5 z-10' />
                            <input
                                type="text"
                                placeholder="Search developers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-3 w-full bg-slate-800/50 text-white border border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                            />
                        </div>
                    </div>


                    {filteredUsers.length >= 3 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

                            <div className="order-2 md:order-1 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50 shadow-xl">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                                        <Medal className="w-8 h-8 text-black" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{topUsers[1]?.username}</h3>
                                    <div className="flex items-center justify-center space-x-2 mb-2">
                                        <Zap className="w-4 h-4 text-blue-400" />
                                        <span className="text-blue-400 font-semibold">{topUsers[1]?.xp.toLocaleString()} XP</span>
                                    </div>
                                    <p className="text-slate-400">Level {topUsers[1]?.level}</p>
                                </div>
                            </div>


                            <div className="order-1 md:order-2 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 rounded-2xl p-6 border border-yellow-500/30 shadow-xl transform md:scale-105">
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                                        <Crown className="w-10 h-10 text-black" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">{topUsers[0]?.username}</h3>
                                    <div className="flex items-center justify-center space-x-2 mb-2">
                                        <Zap className="w-5 h-5 text-yellow-400" />
                                        <span className="text-yellow-400 font-bold text-lg">{topUsers[0]?.xp.toLocaleString()} XP</span>
                                    </div>
                                    <p className="text-slate-300">Level {topUsers[0]?.level}</p>
                                </div>
                            </div>


                            <div className="order-3 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50 shadow-xl">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                                        <Trophy className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{topUsers[2]?.username}</h3>
                                    <div className="flex items-center justify-center space-x-2 mb-2">
                                        <Zap className="w-4 h-4 text-amber-400" />
                                        <span className="text-amber-400 font-semibold">{topUsers[2]?.xp.toLocaleString()} XP</span>
                                    </div>
                                    <p className="text-slate-400">Level {topUsers[2]?.level}</p>
                                </div>
                            </div>
                        </div>
                    )}


                    <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 shadow-2xl backdrop-blur-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-700/50">
                                <thead className="bg-slate-800/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                            Rank
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                            Developer
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                            Xp
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                            Level
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                            Streak
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/30">
                                    {filteredUsers.map((user, index) => (
                                        <tr key={user.id} className={`transition-all duration-200 group ${user.id === currentUserId
                                            ? "bg-blue-900/40 border-l-4 border-blue-500"
                                            : "hover:bg-slate-800/30"
                                            }`}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">{getRankIcon(index)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                                        <span className="text-white font-semibold text-sm">
                                                            {user.username.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div onClick={() => openUserModal(user)} className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                                                            {user.username}
                                                        </div>
                                                        {/* <div
                                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRankBadge(index)}`}
                                                    >
                                                        #{index + 1}
                                                    </div> */}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <Zap className="w-4 h-4 text-blue-400" />
                                                    <span className="text-sm font-semibold text-blue-400">{user.xp.toLocaleString()}</span>
                                                    <span className="text-xs text-slate-400">XP</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="bg-slate-700 rounded-full px-3 py-1">
                                                        <span className="text-sm font-medium text-white">{user.level}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {user.current_streak > 0 ? (
                                                    <div className="flex items-center space-x-2">
                                                        <Flame className="w-4 h-4 text-orange-400" />
                                                        <span className="text-sm font-medium text-orange-400">{user.current_streak} days</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-500 text-sm">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {total_pages > 1 && (
                        <div className="flex items-center justify-center mt-8 gap-1">{renderPaginationButtons()}</div>
                    )}


                    {filteredUsers.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-slate-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <Search className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-300 mb-2">No developers found</h3>
                            <p className="text-slate-400">Try adjusting your search terms</p>
                        </div>
                    )}
                </div>
            )}
            {/* modal */}
            {showModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-200 scale-100 border border-gray-200">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                        <span className="text-xl font-bold text-white">{selectedUser.username.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">{selectedUser.username}</h2>
                                        <p className="text-blue-100 text-sm">Level {selectedUser.level}</p>
                                    </div>
                                </div>
                                <button onClick={closeUserModal} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                                    <X size={20} className="text-white" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="space-y-4">
                                {/* XP Display */}
                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                            {selectedUser.xp.toLocaleString()}
                                        </p>
                                        <p className="text-gray-600 text-sm font-medium">Experience Points</p>
                                    </div>
                                </div>

                                {/* Streak Display */}
                                {selectedUser.current_streak > 0 && (
                                    <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border border-orange-100">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                                {selectedUser.current_streak}
                                            </p>
                                            <p className="text-gray-600 text-sm font-medium">
                                                Day{selectedUser.current_streak !== 1 ? "s" : ""} Streak 🔥
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 p-6 pt-0 border-t border-gray-200">
                            <button
                                onClick={() => handleMessage(selectedUser.id)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                <MessageCircle size={18} />
                                Message
                            </button>
                            <button
                                onClick={() => setShowReportModal(true)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-medium transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                                <CircleAlert size={18} />
                                Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showReportModal && selectedUser && (
                <ReportModal
                    show={showReportModal}
                    onclose={() => setShowReportModal(false)}
                    reportedUserId={selectedUser.id}
                />
            )}
        </div>
    )
}

export default LeaderBoard
