"use client"

import { useState } from "react"
import { Code, X } from "lucide-react"
import axiosInstance from "@/api/axiosInstance"
import toast from "react-hot-toast"

function ChallengeRequestModal({ show, onCancel }) {
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [difficulty, setDifficulty] = useState("easy")
    const [language, setLanguage] = useState("")
    const [sampleInput, setSampleInput] = useState("")
    const [sampleOutput, setSampleOutput] = useState("")

    if (!show) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)
            await axiosInstance.post('/challenge/create-challenge-request/', {
                title,
                description,
                difficulty,
                language,
                sample_input: sampleInput,
                sample_output: sampleOutput
            })
            toast.success('Challenge request submitted successfully')
            setTitle("")
            setDescription("")
            setDifficulty("easy")
            setLanguage("")
            setSampleInput("")
            setSampleOutput("")
            onCancel()
        } catch (err) {
            console.error('error submitting challenge request', err)
        } finally {
            setLoading(false)
        }
    }

    const resetForm=()=>{
        setTitle("")
        setDescription("")
        setDifficulty("easy")
        setLanguage("")
        setSampleInput("")
        setSampleOutput("")
    }

    const handleCancel=()=>{
        resetForm()
        onCancel()
    }



    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all duration-200 scale-100 border border-gray-200 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Code className="text-white" size={20} />
                            </div>
                            <h2 className="text-xl font-bold">Submit Challenge Request</h2>
                        </div>
                        <button onClick={handleCancel} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                            <X size={20} className="text-white" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <form className="space-y-4">
                        <div className="space-y-2">
                            <label className="block mb-1 text-gray-800 font-medium">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full border border-gray-300 px-4 py-2 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                placeholder="Enter challenge title"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block mb-1 text-gray-800 font-medium">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full border border-gray-300 px-4 py-2 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={4}
                                required
                                placeholder="Describe the challenge problem"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block mb-1 text-gray-800 font-medium">Difficulty</label>
                                <select
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(e.target.value)}
                                    className="w-full border border-gray-300 px-4 py-2 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block mb-1 text-gray-800 font-medium">Language</label>
                                <input
                                    type="text"
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="w-full border border-gray-300 px-4 py-2 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. Python, JavaScript"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block mb-1 text-gray-800 font-medium">Sample Input</label>
                            <textarea
                                value={sampleInput}
                                onChange={(e) => setSampleInput(e.target.value)}
                                className="w-full border border-gray-300 px-4 py-2 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                placeholder="Provide sample input for the challenge"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block mb-1 text-gray-800 font-medium">Sample Output</label>
                            <textarea
                                value={sampleOutput}
                                onChange={(e) => setSampleOutput(e.target.value)}
                                className="w-full border border-gray-300 px-4 py-2 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                placeholder="Provide expected output for the sample input"
                            />
                        </div>
                    </form>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 px-6 pb-6">
                    <button
                        onClick={handleCancel}
                        className="px-6 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !title || !description}
                        className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? "Submitting..." : "Submit Request"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ChallengeRequestModal
