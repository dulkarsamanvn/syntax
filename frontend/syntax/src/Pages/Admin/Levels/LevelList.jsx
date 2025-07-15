import AdminSideBar from "@/Components/AdminSideBar"
import { Plus, Crown, Edit } from "lucide-react"
import { useEffect, useState } from "react"
import CreateLevelModal from "./CreateLevelModal"
import axiosInstance from "@/api/axiosInstance"


function LevelList() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [levels, setLevels] = useState([])
  const [selectedLevel,setSelectedLevel]=useState(null)

  useEffect(() => {
    fetchLevels()
  }, [])

  const fetchLevels = async () => {
    try {
      const res = await axiosInstance.get('/profile/list-levels/')
      setLevels(res.data)
    } catch (err) {
      console.error("error fetching levels", err)
    }
  }

  const handleLevelCreated = () => {
    setIsModalOpen(false)
    fetchLevels()
  }

  return (
    <div className="flex min-h-screen bg-slate-900">
      <AdminSideBar />

      <div className="flex-1 p-6 lg:p-8">

        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Levels</h1>
              <p className="text-slate-400">Manage and create Progress Levels</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              Create Level
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {levels.map((level) => (
              <div key={level.id} className="bg-slate-800 rounded-xl p-4 text-white border border-slate-600 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <span>Level {level.number}</span>
                    <Crown className="w-4 h-4 text-yellow-400" />
                  </div>
                  <button
                    onClick={()=>{
                      setSelectedLevel(level)
                      setIsModalOpen(true)
                    }}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    title="Edit Level">
                    <Edit size={16} />
                  </button>
                </div>
                <p className="text-slate-300 text-sm">XP Needed: {level.xp_threshold}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <CreateLevelModal
       isOpen={isModalOpen} 
       onClose={() =>{
         setIsModalOpen(false)
         setSelectedLevel(null)
        }} 
       onSuccess={handleLevelCreated} 
       isEdit={Boolean(selectedLevel)}
       initialData={selectedLevel}
       />
    </div>
  )
}

export default LevelList
