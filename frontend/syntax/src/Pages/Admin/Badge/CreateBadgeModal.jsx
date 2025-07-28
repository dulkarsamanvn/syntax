import axiosInstance from "@/api/axiosInstance"
import { useEffect, useState } from "react"
import { X, Hash, Zap, Camera } from "lucide-react"

function CreateBadgeModal({ isOpen, onClose, onSuccess, isEdit, initialData }) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [icon, setIcon] = useState(null)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")

    useEffect(() => {
        if (isOpen) {
            if (isEdit && initialData) {
                setTitle(initialData.title)
                setDescription(initialData.description)
                setIcon(null)
            } else {
                setTitle('')
                setDescription('')
                setIcon(null)
            }
            setMessage('')
        }
    }, [isEdit, initialData,isOpen])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage("")

        if (!title || !description || (!icon && !isEdit)) {
            setMessage("All fields are required.")
            setLoading(false)
            return
        }


        try {
            const formData = new FormData()
            formData.append("title", title)
            formData.append("description", description)

            if(icon){
                formData.append("icon", icon)
            }
            
            if (isEdit && initialData) {
                await axiosInstance.patch(`/badge/${initialData.id}/update-badge/`, formData).then(res => console.log(res.data))
                setMessage("Badge updated successfully!")
            } else {
                await axiosInstance.post("/badge/create-badge/", formData)
                setMessage("Badge created successfully!")
            }
            setTimeout(() => {
                onSuccess()
                onClose()
            }, 1500)
        } catch (err) {
            console.error("failed to create badge", err)
            setMessage("Failed to submit badge. Please try again.")
        } finally {
            setLoading(false)

        }
    }

    if (!isOpen) return null

    const handleChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setIcon(file)
        }
    }


    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold">{isEdit ? 'Edit Badge' : 'Create New Badge'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Message */}
                {message && (
                    <div
                        className={`p-4 text-center font-medium ${message.includes("successfully")
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
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    placeholder="Enter title"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all"
                                />
                            </div>
                            <div>

                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Zap size={16} />
                                    Description
                                </label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                    placeholder="Enter Description"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Camera size={16} />
                                    Badge Icon
                                </label>

                                {/* Image Preview (for both edit + new uploads) */}
                                <div className="flex items-center gap-4">
                                    {icon && typeof icon === 'object' ? (
                                        <img
                                            src={URL.createObjectURL(icon)}
                                            alt="Preview"
                                            className="w-16 h-16 object-cover rounded-full border"
                                        />
                                    ) : (
                                        isEdit && initialData?.icon && (
                                            <img
                                                src={initialData.icon}
                                                alt="Current"
                                                className="w-16 h-16 object-cover rounded-full border"
                                            />
                                        )
                                    )}

                                    <label htmlFor="icon-input" className="px-4 py-2 bg-slate-700 text-white rounded-lg cursor-pointer hover:bg-slate-600 transition-colors text-sm font-medium">
                                        {icon ? "Change Icon" : "Upload Icon"}
                                    </label>
                                    <input
                                        id="icon-input"
                                        type="file"
                                        name="icon"
                                        accept="image/*"
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                </div>
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
                                disabled={loading || !title || !description || (!icon && !isEdit)}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        {isEdit ? "Updating..." : "Creating..."}
                                    </span>
                                ) : (
                                    isEdit ? "Update Badge" : "Create Badge"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default CreateBadgeModal
