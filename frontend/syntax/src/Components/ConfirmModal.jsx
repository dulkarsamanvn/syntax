"use client"

import { AlertTriangle, X } from "lucide-react"

function ConfirmModal({ show, onClose, onConfirm, actionText }) {
  if (!show) return null

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
              <h2 className="text-xl font-bold">Confirm Action</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <X size={20} className="text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 text-base leading-relaxed">{actionText}</p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-6 pt-0  border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 border-t"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-medium transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
