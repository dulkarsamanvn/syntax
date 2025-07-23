import axiosInstance from '@/api/axiosInstance'
import AdminSideBar from '@/Components/AdminSideBar'
import React, { useEffect, useState } from 'react'
import { Search, ChevronLeft, ChevronRight, Users, Ban } from 'lucide-react'
import Spinner from '@/Components/Spinner'
import toast from 'react-hot-toast'
import ConfirmModal from '@/Components/ConfirmModal'

function GroupManagement() {
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState('')
    const [groups, setGroups] = useState([])
    const [blockModal, setBlockModal] = useState(false)
    const [selectedGroup, setSelectedGroup] = useState(null)
    const [count, setCount] = useState(0)
    const GROUPS_PER_PAGE = 5
    const totalPages = Math.ceil(count / GROUPS_PER_PAGE)

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                setLoading(true)
                const params = {
                    page: currentPage,
                    page_size: GROUPS_PER_PAGE
                }
                if (searchQuery) {
                    params.search = searchQuery
                }
                const res = await axiosInstance.get('/chat/group-list/', { params })
                setGroups(res.data.results)
                setCount(res.data.count)
            } catch (err) {
                console.error('error fetching groups', err)
            } finally {
                setLoading(false)
            }
        }

        fetchGroups()
    }, [searchQuery, currentPage])


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
                    className={`px-3 py-2 rounded transition-colors ${currentPage === i ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-700"
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

    const openModal = (group) => {
        setSelectedGroup(group)
        setBlockModal(true)
    }

    const handleToggleStatus = async () => {
        if (!selectedGroup) return

        const groupId = selectedGroup.id
        const currentStatus = selectedGroup.is_active

        try {
            const res = await axiosInstance.patch(`/chat/${groupId}/block/`, {
                is_active: !currentStatus,
            })
            toast.success(res.data.message || `Group ${!currentStatus ? "activated" : "deactivated"} successfully`)
            setGroups((prevGroups) =>
                prevGroups.map((group) =>
                    group.id === groupId ? { ...group, is_active: !currentStatus } : group
                )
            )
            setBlockModal(false)
            setSelectedGroup(null)
        }catch(err){
            console.error('error blocking group',err)
            toast.error('Failed to update group status')
        }
    }

    return (
        <div className="flex min-h-screen bg-slate-900">
            <AdminSideBar />
            <div className="flex-1 p-6 lg:p-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-white mb-2">Group Management</h1>
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
                    ) : groups.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="mx-auto text-slate-600 mb-4" size={48} />
                            <h3 className="text-lg font-medium text-slate-300 mb-2">No groups found</h3>
                            <p className="text-slate-500">Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-700/50 border-b border-slate-600">
                                        <th className="text-left px-6 py-4 text-slate-300 font-medium">Name</th>
                                        <th className="text-left px-6 py-4 text-slate-300 font-medium">Description</th>
                                        <th className="text-left px-6 py-4 text-slate-300 font-medium">Private</th>
                                        <th className="text-left px-6 py-4 text-slate-300 font-medium">Created At</th>
                                        <th className="text-left px-6 py-4 text-slate-300 font-medium">Status</th>
                                        <th className="text-left px-6 py-4 text-slate-300 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groups.map((group, index) => (
                                        <tr
                                            key={group.id}
                                            className={`border-b border-slate-700 hover:bg-slate-700/30 transition-colors ${index % 2 === 0 ? "bg-slate-800/50" : "bg-slate-800/20"
                                                }`}
                                        >
                                            <td className="px-6 py-4 text-white">{group.name}</td>
                                            <td className="px-6 py-4 text-white">{group.description}</td>
                                            <td className="px-6 py-4 text-slate-400">{group.is_private ? 'Private' : 'Public'}</td>
                                            <td className="px-6 py-4 text-blue-400 font-semibold">{new Date(group.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${group.is_active
                                                        ? "bg-green-100 text-green-800 border border-green-200"
                                                        : "bg-red-100 text-red-800 border border-red-200"
                                                        }`}
                                                >
                                                    <div
                                                        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${group.is_active ? "bg-green-500" : "bg-red-500"
                                                            }`}
                                                    />
                                                    {group.is_active ? "Active" : "Blocked"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => openModal(group)}
                                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                                                    title="Ban Group"
                                                >
                                                    <Ban size={16} />
                                                </button>
                                            </td>
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
            <ConfirmModal
                show={blockModal}
                onClose={() => setBlockModal(false)}
                onConfirm={handleToggleStatus}
                actionText={`Are you sure you want to ${selectedGroup?.is_active ? "block" : "unblock"} this group?`}
            />
        </div>
    )
}

export default GroupManagement
