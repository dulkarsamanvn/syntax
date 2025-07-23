import axiosInstance from "@/api/axiosInstance"
import { useEffect, useState } from "react"
import { X, Hash, Zap } from "lucide-react"

function CreateLevelModal({ isOpen, onClose, onSuccess,isEdit,initialData }) {
  const [number, setNumber] = useState("")
  const [xp, setXp] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(()=>{
    if(isOpen){
      if(isEdit && initialData){
        setNumber(initialData.number)
        setXp(initialData.xp_threshold)
      }else{
        setNumber('')
        setXp('')
      }
      setMessage('')
    }
  },[isEdit,initialData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    if (!number || !xp) {
      setMessage("All fields are required.")
      return
    }

    const levelNumber = parseInt(number)
    const xpValue = parseInt(xp)

    if (isNaN(levelNumber) || levelNumber < 1) {
      setMessage("Level number must be a positive integer.")
      return
    }

    if (isNaN(xpValue) || xpValue < 0) {
      setMessage("XP threshold must be 0 or more.")
      return
    }

    try {
      if(isEdit && initialData){
        await axiosInstance.put(`/profile/${initialData.id}/update-level/`,{
          number,
          xp_threshold: xp,
        }).then(res=>console.log(res.data))
        setMessage("Level updated successfully!")
      }else{
        await axiosInstance.post("/profile/create-level/", {
          number,
          xp_threshold: xp,
        })
        setMessage("Level created successfully!")
      }
      setNumber("")
      setXp("")
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1500)
    } catch (err) {
      console.error("failed to create level", err)
      setMessage("Failed to submit level. Please try again.")
    } finally {
      setLoading(false)
      
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">{isEdit?'Edit Level':'Create New Level'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`p-4 text-center font-medium ${
              message.includes("successfully")
                ? "bg-green-100 text-green-800 border-green-200"
                : "bg-red-100 text-red-800 border-red-200"
            } border-b`}
          >
            {message}
          </div>
        )}

        {/* Form Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Hash size={16} />
                  Level Number
                </label>
                <input
                  type="number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  required
                  min="1"
                  placeholder="Enter level number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Zap size={16} />
                  XP Threshold
                </label>
                <input
                  type="number"
                  value={xp}
                  onChange={(e) => setXp(e.target.value)}
                  required
                  min="0"
                  placeholder="Enter XP threshold"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum XP required to reach this level</p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !number || !xp}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {isEdit ? "Updating..." : "Creating..."}
                  </span>
                ) : (
                  isEdit?"Update Level":"Create Level"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateLevelModal
