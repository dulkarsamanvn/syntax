import axiosInstance from '@/api/axiosInstance'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, X } from 'lucide-react'

function ReportModal({ show, onclose, reportedUserId }) {
    if (!show) return null

    const reasons = [
        { value: 'spam', label: 'Spam' },
        { value: 'abuse', label: 'Abusive Behavior' },
        { value: 'inappropriate', label: 'Inappropriate Content' },
        { value: 'other', label: 'Other' },
    ]
    const [reportReason, setReportReason] = useState('')
    const [description, setDescription] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const navigate = useNavigate()

    const handleSubmit = async () => {
        setSubmitting(true)
        try {
            await axiosInstance.post('/leaderboard/report-user/', {
                reported_user_id: reportedUserId,
                reportReason,
                description
            })
            onclose()
            navigate('/leaderboard')
        } catch (err) {
            console.error('error submitting', err)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-200 scale-100 border border-gray-200">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <AlertTriangle className="text-white" size={20} />
                            </div>
                            <h2 className="text-xl font-bold">Report User</h2>
                        </div>
                        <button onClick={onclose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                            <X size={20} className="text-white" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="mb-4">
                        <label className="block mb-1 text-gray-800 font-medium">Reason</label>
                        <select
                            className="w-full border border-gray-300 px-4 py-2 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                        >
                            <option value="">Select reason</option>
                            {reasons.map((r) => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1 text-gray-800 font-medium">Description</label>
                        <textarea
                            className="w-full border border-gray-300 px-4 py-2 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 px-6 pb-6">
                    <button
                        onClick={onclose}
                        className="px-6 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={submitting || !reportReason}
                        onClick={handleSubmit}
                        className="px-6 py-3 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-medium transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                    >
                        {submitting ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ReportModal
