import axiosInstance from "@/api/axiosInstance"
import AdminSideBar from "@/Components/AdminSideBar"
import Spinner from "@/Components/Spinner"
import { Activity, Ban, CheckCircle, Edit, Plus, Search } from "lucide-react"
import { useEffect, useState } from "react"
import CreateBadgeModal from "./CreateBadgeModal"
import ConfirmModal from "@/Components/ConfirmModal"
import toast from "react-hot-toast"

function BadgeManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [badges, setBadges] = useState([])
  const [selectedBadge, setSelectedBadge] = useState(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [blockModal, setBlockModal] = useState(false)

  const fetchBadges = async () => {
    try {
      setLoading(true)
      const res = await axiosInstance.get("/badge/badge-list/")
      setBadges(res.data)
    } catch (err) {
      console.error("error fetching badges", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBadges()
  }, [])

  const handleBadgeCreated = () => {
    setIsModalOpen(false)
    fetchBadges()
  }

  const filteredBadges = badges.filter((badge) => {
    const matchesSearch = badge.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && badge.is_active) ||
      (filterStatus === "inactive" && !badge.is_active)
    return matchesSearch && matchesStatus
  })

  const handleToggleStatus = async () => {
    if (!selectedBadge) {
      return
    }
    const badgeId = selectedBadge.id
    const currentStatus = selectedBadge.is_active
    try {
      const response = await axiosInstance.post(`/badge/${badgeId}/block/`, {
        is_active: !currentStatus,
      })
      toast.success(response.data.message || `Badge ${!currentStatus ? "activated" : "deactivated"} successfully`)
      setBadges((prevBadge) =>
        prevBadge.map((badge) => (badge.id === badgeId ? { ...badge, is_active: !currentStatus } : badge)),
      )
      setBlockModal(false)
      setSelectedBadge(null)
    } catch (error) {
      console.error("Error toggling badge status:", error)
      toast.error("Failed to update badge status")
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-900">
      <AdminSideBar />
      <div className="flex-1 p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Badges</h1>
              <p className="text-slate-400">Manage and create Badges</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              Create Badge
            </button>
          </div>
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search badges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl shadow-xl overflow-hidden backdrop-blur-sm">
          {loading ? (
            <Spinner />
          ) : filteredBadges.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="mx-auto text-slate-600 mb-4" size={48} />
              <h3 className="text-lg font-medium text-slate-300 mb-2">
                {searchTerm || filterStatus !== "all" ? "No badges match your filters" : "No badges found"}
              </h3>
              <p className="text-slate-500 mb-4">
                {badges.length === 0
                  ? "Get started by creating your first badge"
                  : "Try adjusting your search or filters"}
              </p>
              {badges.length === 0 && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Plus size={16} />
                  Create First Badge
                </button>
              )}
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredBadges.map((b) => (
                  <div
                    key={b.id}
                    className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white border border-slate-600/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:border-blue-500/30 backdrop-blur-sm"
                  >

                    {/* Badge Icon */}
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        {b.icon ? (
                          <img
                            src={b.icon || "/placeholder.svg"}
                            alt={b.title}
                            className="w-20 h-20 rounded-full border-4 border-slate-600 shadow-lg group-hover:border-blue-500/50 transition-all duration-300"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-3xl shadow-lg">
                            🏅
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Badge Content */}
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                        {b.title}
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">{b.description}</p>
                    </div>

                    {/* Status Badge */}
                    <div className="flex justify-center mb-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${b.is_active
                            ? "bg-green-500/20 text-green-300 border border-green-500/30"
                            : "bg-red-500/20 text-red-300 border border-red-500/30"
                          }`}
                      >
                        {b.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedBadge(b)
                          setIsModalOpen(true)
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-blue-200 rounded-lg transition-all duration-200 border border-blue-500/30 hover:border-blue-400/50"
                        title="Edit Badge"
                      >
                        <Edit size={14} />
                        <span className="text-sm font-medium">Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedBadge(b)
                          setBlockModal(true)
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 border ${b.is_active
                            ? "bg-red-600/20 hover:bg-red-600/30 text-red-300 hover:text-red-200 border-red-500/30 hover:border-red-400/50"
                            : "bg-green-600/20 hover:bg-green-600/30 text-green-300 hover:text-green-200 border-green-500/30 hover:border-green-400/50"
                          }`}
                        title={b.is_active ? "Block Badge" : "Activate Badge"}
                      >
                        {b.is_active ? <Ban size={14} /> : <CheckCircle size={14} />}
                        <span className="text-sm font-medium">{b.is_active ? "Block" : "Activate"}</span>
                      </button>
                    </div>

                    {/* Hover overlay effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <CreateBadgeModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedBadge(null)
          }}
          onSuccess={fetchBadges}
          isEdit={Boolean(selectedBadge)}
          badgeId={selectedBadge?.id}
          initialData={selectedBadge}
        />
      )}

      <ConfirmModal
        show={blockModal}
        onClose={() => setBlockModal(false)}
        onConfirm={handleToggleStatus}
        actionText={`Are you sure you want to ${selectedBadge?.is_active ? "block" : "unblock"} this badge?`}
      />
    </div>
  )
}

export default BadgeManagement
