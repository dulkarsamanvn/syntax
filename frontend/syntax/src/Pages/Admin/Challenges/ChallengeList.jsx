import axiosInstance from "@/api/axiosInstance"
import AdminSideBar from "@/Components/AdminSideBar"
import { useEffect, useState } from "react"
import CreateChallengeModal from "./CreateChallengeModal"
import { Plus, Search, Eye, Edit, Trash2, Crown, Clock, Trophy, Activity, Ban, CheckCircle,ChevronLeft, ChevronRight } from "lucide-react"
import ConfirmModal from "@/Components/ConfirmModal"
import Spinner from "@/Components/Spinner"

function ChallengeList() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDifficulty, setFilterDifficulty] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [message, setMessage] = useState("")
  const [selectedChallenge,setSelectedChallenge]=useState(null)
  const [blockModal,setBlockModal]=useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [count, setCount] = useState(0)


  const CHALLENGES_PER_PAGE=4
  const totalPages = Math.ceil(count / CHALLENGES_PER_PAGE)

  const fetchChallenges = async () => {
    try {
      setLoading(true)
      const params={
        page:currentPage,
        page_size:CHALLENGES_PER_PAGE
      }
      const res = await axiosInstance.get("/challenge/list/",{params})
      setChallenges(res.data.results || [])
      setCount(res.data.count || 0)
    } catch (error) {
      console.error("Error Fetching Challenges", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChallenges()
  }, [currentPage])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("")
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [message])

  const filteredChallenges = challenges.filter((challenge) => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDifficulty = filterDifficulty === "all" || challenge.difficulty === filterDifficulty
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && challenge.is_active) ||
      (filterStatus === "inactive" && !challenge.is_active)

    return matchesSearch && matchesDifficulty && matchesStatus
  })

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "hard":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const openModal=(challenge)=>{
    setSelectedChallenge(challenge)
    setBlockModal(true)
  }

  const handleToggleStatus = async () => {
    if(!selectedChallenge){
      return
    }

    const challengeId=selectedChallenge.id
    const currentStatus=selectedChallenge.is_active
    try {
      const response = await axiosInstance.patch(`/challenge/${challengeId}/block/`, {
        is_active: !currentStatus,
      })

      setMessage(response.data.message || `Challenge ${!currentStatus ? "activated" : "deactivated"} successfully`)

      setChallenges((prevChallenges) =>
        prevChallenges.map((challenge) =>
          challenge.id === challengeId ? { ...challenge, is_active: !currentStatus } : challenge,
        ),
      )
      setBlockModal(false)
      setSelectedChallenge(null)
    } catch (error) {
      console.error("Error toggling challenge status:", error)
      setMessage("Failed to update challenge status")
    }
  }

  const renderPagination = () => {
    const buttons = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // Previous
    buttons.push(
      <button
        key="prev"
        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>,
    )

    // Page Numbers
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-2 rounded-lg ${
            currentPage === i
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-700"
          }`}
        >
          {i}
        </button>,
      )
    }

    // Ellipsis + Last Page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="ellipsis" className="px-3 py-2 text-slate-400">
            ...
          </span>,
        )
      }

      buttons.push(
        <button
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className="px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"
        >
          {totalPages}
        </button>,
      )
    }

    // Next
    buttons.push(
      <button
        key="next"
        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50"
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
        
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Challenges</h1>
              <p className="text-slate-400">Manage and create coding challenges</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              Create Challenge
            </button>
          </div>

         
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search challenges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            
            <div className="flex gap-3">
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

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

       
        <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
          {loading ? (
            <Spinner/>
          ) : filteredChallenges.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="mx-auto text-slate-600 mb-4" size={48} />
              <h3 className="text-lg font-medium text-slate-300 mb-2">
                {searchTerm || filterDifficulty !== "all" || filterStatus !== "all"
                  ? "No challenges match your filters"
                  : "No challenges found"}
              </h3>
              <p className="text-slate-500 mb-4">
                {challenges.length === 0
                  ? "Get started by creating your first challenge"
                  : "Try adjusting your search or filters"}
              </p>
              {challenges.length === 0 && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Plus size={16} />
                  Create First Challenge
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-700/50 border-b border-slate-600">
                    <th className="text-left px-6 py-4 text-slate-300 font-medium">Challenge</th>
                    <th className="text-left px-6 py-4 text-slate-300 font-medium">Difficulty</th>
                    <th className="text-left px-6 py-4 text-slate-300 font-medium">Time Limit</th>
                    <th className="text-left px-6 py-4 text-slate-300 font-medium">XP Reward</th>
                    <th className="text-left px-6 py-4 text-slate-300 font-medium">Access</th>
                    <th className="text-left px-6 py-4 text-slate-300 font-medium">Status</th>
                    <th className="text-left px-6 py-4 text-slate-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChallenges.map((challenge, index) => (
                    <tr
                      key={challenge.id}
                      className={`border-b border-slate-700 hover:bg-slate-700/30 transition-colors ${
                        index % 2 === 0 ? "bg-slate-800/50" : "bg-slate-800/20"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <h3 className="text-white font-medium">{challenge.title}</h3>
                          {challenge.description && (
                            <p className="text-slate-400 text-sm mt-1 truncate max-w-xs">{challenge.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(
                            challenge.difficulty,
                          )}`}
                        >
                          {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-300">
                          <Clock size={16} />
                          <span>{challenge.time_limit}m</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-300">
                          <Trophy size={16} />
                          <span>{challenge.xp_reward} XP</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {challenge.is_premium ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                            <Crown size={12} />
                            Premium
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            Free
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            challenge.is_active
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : "bg-gray-100 text-gray-800 border border-gray-200"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              challenge.is_active ? "bg-green-500" : "bg-gray-500"
                            }`}
                          />
                          {challenge.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={()=>{
                              setSelectedChallenge(challenge)
                              setIsModalOpen(true)
                            }}
                            className="p-2 text-slate-400 hover:text-yellow-400 hover:bg-slate-700 rounded-lg transition-colors"
                            title="Edit Challenge"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => openModal(challenge)}
                            className={`p-2 rounded-lg transition-colors ${
                              challenge.is_active
                                ? "text-slate-400 hover:text-red-400 hover:bg-slate-700"
                                : "text-slate-400 hover:text-green-400 hover:bg-slate-700"
                            }`}
                            title={challenge.is_active ? "Block Challenge" : "Activate Challenge"}
                          >
                            {challenge.is_active ? <Ban size={16} /> : <CheckCircle size={16} />}
                          </button>
                          
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-1">
          {renderPagination()}
        </div>
      )}

        {/* Results count
        {!loading && filteredChallenges.length > 0 && (
          <div className="mt-4 text-slate-400 text-sm">
            Showing {filteredChallenges.length} of {challenges.length} challenges
          </div>
        )} */}

        {/* Success Message */}
        {message && (
          <div
            className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
              message.includes("successfully") || message.includes("activated") || message.includes("deactivated")
                ? "bg-green-100 border border-green-400 text-green-700"
                : "bg-red-100 border border-red-400 text-red-700"
            }`}
          >
            {message}
          </div>
        )}
      </div>

      {isModalOpen && (
        <CreateChallengeModal 
        isOpen={isModalOpen} 
        onClose={() =>{
          setIsModalOpen(false)
          setSelectedChallenge(null)  
        } } 
        onSuccess={fetchChallenges} 
        isEdit={Boolean(selectedChallenge)}
        challengeId={selectedChallenge?.id}
        initialData={selectedChallenge}
        />
      )}

      <ConfirmModal
      show={blockModal}
      onClose={()=>setBlockModal(false)}
      onConfirm={handleToggleStatus}
      actionText={`Are you sure you want to ${selectedChallenge?.is_active ? "block" : "unblock"} this challenge?`}
      />
      
    </div>
  )
}

export default ChallengeList
