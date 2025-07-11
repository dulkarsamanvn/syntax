import { useEffect, useState } from "react"
import { Search, ChevronDown, ChevronLeft, ChevronRight, Users } from "lucide-react"
import AdminSideBar from "../../Components/AdminSideBar"
import axiosInstance from "../../api/axiosInstance"
import ConfirmModal from "../../Components/ConfirmModal"
import Spinner from "@/Components/Spinner"

function UserManagement() {
  const [users, setUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterActive, setFilterActive] = useState("")
  const [message, setMessage] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [count, setCount] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const USERS_PER_PAGE = 5

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
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
      } finally {
        setLoading(false)
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
          className={`px-3 py-2 rounded-lg transition-colors ${
            currentPage === i ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-700"
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

  return (
    <div className="flex min-h-screen bg-slate-900">
      <AdminSideBar />

      <div className="flex-1 p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
              <p className="text-slate-400">Manage and monitor user accounts</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
                className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-10"
              >
                <option value="">All Users</option>
                <option value="active">Active Users</option>
                <option value="blocked">Blocked Users</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
          {loading ? (
            <Spinner/>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto text-slate-600 mb-4" size={48} />
              <h3 className="text-lg font-medium text-slate-300 mb-2">
                {searchQuery || filterActive ? "No users match your filters" : "No users found"}
              </h3>
              <p className="text-slate-500">
                {searchQuery || filterActive
                  ? "Try adjusting your search or filters"
                  : "Users will appear here once they register"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-700/50 border-b border-slate-600">
                    <th className="text-left px-6 py-4 text-slate-300 font-medium">User</th>
                    <th className="text-left px-6 py-4 text-slate-300 font-medium">Status</th>
                    <th className="text-left px-6 py-4 text-slate-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr
                      key={user.id}
                      className={`border-b border-slate-700 hover:bg-slate-700/30 transition-colors ${
                        index % 2 === 0 ? "bg-slate-800/50" : "bg-slate-800/20"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${getAvatarColor(index)}`}
                          >
                            {getInitials(user.username)}
                          </div>
                          <div>
                            <h3 className="text-white font-medium">{user.username}</h3>
                            <p className="text-slate-400 text-sm">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            user.is_active
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : "bg-red-100 text-red-800 border border-red-200"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              user.is_active ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                          {user.is_active ? "Active" : "Blocked"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openModal(user)}
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                            user.is_active
                              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                              : "bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30"
                          }`}
                        >
                          {user.is_active ? "Block User" : "Unblock User"}
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
        {total_pages > 1 && (
          <div className="flex items-center justify-center mt-8 gap-1">{renderPaginationButtons()}</div>
        )}

        {/* Results count
        {!loading && users.length > 0 && (
          <div className="mt-4 text-slate-400 text-sm text-center">
            Showing {users.length} of {count} users (Page {currentPage} of {total_pages})
          </div>
        )} */}

        {/* Success Message */}
        {message && (
          <div className="fixed top-4 right-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg shadow-lg z-50">
            {message}
          </div>
        )}
      </div>

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
