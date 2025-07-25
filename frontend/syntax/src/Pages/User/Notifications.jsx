import axiosInstance from "@/api/axiosInstance"
import Spinner from "@/Components/Spinner"
import { CheckCircle } from "lucide-react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

function Notifications() {
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState([])
  const navigate = useNavigate()

  const fetchNotification = async () => {
    try {
      setLoading(true)
      const res = await axiosInstance.get("/notification/notification-list/")
      setNotifications(res.data)
    } catch (err) {
      console.error("error fetching notification", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotification()
  }, [])

  const handleMarkAllRead = async () => {
    try {
      await axiosInstance.post("/notification/mark-all-read/")
      toast.success("All notification marked as read")
      fetchNotification()
    } catch (err) {
      console.error("failed to mark notification as read", err)
      toast.error("something went wrong")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <nav className="border-b border-slate-700/50 px-4 md:px-6 py-4 bg-slate-900/95 backdrop-blur-xl shadow-2xl sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate("/home")}>
            <div className="flex items-center">
              <img
                src="/images/logo_new.png"
                alt="SYNTAX Logo"
                className="h-auto w-auto transition-transform hover:scale-105"
              />
            </div>
          </button>
        </div>
      </nav>

      {loading ? (
        <Spinner />
      ) : (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
                <p className="text-slate-400">Stay updated with your latest activities</p>
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <CheckCircle size={18} />
                  <span>Mark all as read</span>
                </button>
              )}
            </div>
          </div>

          {/* Notifications Content */}
          {notifications.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm shadow-xl rounded-xl p-12 text-center">
              <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No notifications yet</h3>
              <p className="text-slate-400">You're all caught up! New notifications will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((note) => (
                <div
                  key={note.id}
                  className={`bg-slate-800/50 border backdrop-blur-sm shadow-xl rounded-xl p-6 transition-all duration-200 hover:bg-slate-800/70 ${
                    note.is_read ? "border-slate-700/50" : "border-blue-500/30 bg-slate-800/70"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {!note.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>}
                        <p
                          className={`text-sm leading-relaxed ${
                            note.is_read ? "text-slate-300" : "text-white font-medium"
                          }`}
                        >
                          {note.message}
                        </p>
                      </div>
                      <p className="text-xs text-slate-400 ml-5">
                        {new Date(note.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {!note.is_read && (
                      <div className="flex-shrink-0 ml-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          New
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Notifications
