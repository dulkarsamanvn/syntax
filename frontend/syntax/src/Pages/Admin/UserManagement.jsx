"use client"

import { useEffect, useState } from "react"
import { Search, Filter, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import AdminSideBar from "../../Components/AdminSideBar"
import axiosInstance from "../../api/axiosInstance"
import ConfirmModal from "../../Components/ConfirmModal"

function UserManagement() {
  const [users, setUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterActive, setFilterActive] = useState("")
  const [message, setMessage] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [count, setCount] = useState(0)

  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  const USERS_PER_PAGE = 5

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const params = {
          page: currentPage,
          page_size: USERS_PER_PAGE,
        }
        if (searchQuery) {
          params.search = searchQuery
        }
        if (filterActive) {
          params.filterActive = filterActive
        }
        const response = await axiosInstance.get("/user-management", { params })
        console.log("Response data:", response.data)
        setUsers(response.data.results || [])
        setCount(response.data.count)
      } catch (error) {
        console.error("Error fetching users:", error.response?.data || error.message)
      }
    }

    fetchUsers()
  }, [searchQuery, filterActive, currentPage])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("")
      }, 1500) 

      return () => clearTimeout(timer) 
    }
  }, [message])

  const total_pages = Math.ceil(count / USERS_PER_PAGE)

  const openModal = (user) => {
    setSelectedUser(user)
    setShowModal(true)
  }

  const handleToggleBlock = async () => {
    if (!selectedUser) {
      return
    }
    const userId = selectedUser.id
    const currentStatus = selectedUser.is_active
    try {
      const response = await axiosInstance.patch(`/user-management/${userId}/block`, { is_active: !currentStatus })
      setMessage(response.data.message)
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === userId ? { ...user, is_active: !currentStatus } : user)),
      )
      setShowModal(false)
    } catch (error) {
      console.error("Error toggling user status:", error.response?.data || error.message)
    }
  }

  const getInitials = (username) => {
    return username ? username.charAt(0).toUpperCase() : "U"
  }

  const getAvatarColor = (index) => {
    const colors = ["bg-purple-500", "bg-blue-500", "bg-pink-500", "bg-indigo-500", "bg-green-500"]
    return colors[index % colors.length]
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
        className="px-3 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
          className={`px-3 py-2 rounded ${
            currentPage === i ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white hover:bg-slate-700"
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
          <span key="ellipsis" className="px-3 py-2 text-gray-400">
            ...
          </span>,
        )
      }
      buttons.push(
        <button
          key={total_pages}
          onClick={() => setCurrentPage(total_pages)}
          className="px-3 py-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded"
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
        className="px-3 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-4 h-4" />
      </button>,
    )

    return buttons
  }

  return (
    <div className="flex min-h-screen bg-slate-900">
      <AdminSideBar />

      <main className="flex-1 p-8 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-semibold text-white">User Management</h1>

            <div className="flex items-center gap-4">
              {/* All Dropdown */}
              <div className="relative">
                <select
                  value={filterActive}
                  onChange={(e) => setFilterActive(e.target.value)}
                  className="appearance-none bg-slate-700 text-white px-4 py-2 pr-8 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

             

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-slate-700 rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="bg-slate-600 px-6 py-4">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-300 uppercase tracking-wider">
                <div className="col-span-5">User</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-5 text-right">Actions</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-slate-600">
              {users.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-400">No users found</div>
              ) : (
                users.map((user, index) => (
                  <div key={user.id} className="px-6 py-4 hover:bg-slate-600 transition-colors">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* User Info */}
                      <div className="col-span-5 flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${getAvatarColor(index)}`}
                        >
                          {getInitials(user.username)}
                        </div>
                        <div>
                          <div className="text-white font-medium">{user.username}</div>
                          <div className="text-gray-400 text-sm">{user.email}</div>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.is_active ? "Active" : "Banned"}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="col-span-5 flex items-center justify-end gap-4">
                        <button
                          onClick={() => openModal(user)}
                          className={`font-medium text-sm transition-colors ${
                            user.is_active ? "text-red-400 hover:text-red-300" : "text-green-400 hover:text-green-300"
                          }`}
                        >
                          {user.is_active ? "Block" : "Unblock"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pagination */}
          {total_pages > 1 && (
            <div className="flex items-center justify-center mt-8 gap-1">{renderPaginationButtons()}</div>
          )}

          {/* Success Message */}
          {message && (
            <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">{message}</div>
          )}
        </div>
      </main>

      <ConfirmModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleToggleBlock}
        actionText={`Are you sure you want to ${selectedUser?.is_active ? "block" : "unblock"} this user?`}
      />
    </div>
  )
}

export default UserManagement
