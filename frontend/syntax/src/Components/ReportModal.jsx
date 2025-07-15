import axiosInstance from '@/api/axiosInstance'
import React, { useState } from 'react'

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

    const handleSubmit = async () => {
        setSubmitting(true)
        try {
            await axiosInstance.post('/leaderboard/report-user/', {
                reported_user_id: reportedUserId,
                reportReason,
                description
            })
            onclose()
            Navigate('/leaderboard')
        } catch (err) {
            console.error('error submitting', err)
        } finally {
            setSubmitting(false)
        }
    }
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
                <h1 className="text-xl text-black font-bold mb-4">Report User</h1>

                <div className="mb-4">
                    <label className="block mb-1 text-black font-medium">Reason</label>
                    <select
                        className="w-full border px-3 py-2 rounded text-black"
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
                    <label className="block mb-1 text-black font-medium">Description</label>
                    <textarea
                        className="w-full border px-3 py-2 text-black rounded"
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)} // <-- Fixed here
                    ></textarea>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onclose}
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={submitting || !reportReason}
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                    >
                        {submitting ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ReportModal
