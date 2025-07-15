import axiosInstance from "@/api/axiosInstance"
import AdminSideBar from "@/Components/AdminSideBar"
import Spinner from "@/Components/Spinner"
import { useEffect, useState } from "react"
import { Search, AlertTriangle, User, FileText, Shield, CheckCircle, Clock, Ban } from "lucide-react"

function ReportManagement() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true)
        const res = await axiosInstance.get("/leaderboard/report-list/")
        setReports(res.data)
      } catch (err) {
        console.error("error fetching reports", err)
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("")
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [message])

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      await axiosInstance.patch(`/leaderboard/report-status-update/${reportId}/`, {
        status: newStatus,
      })
      setReports((prev) => prev.map((report) => (report.id === reportId ? { ...report, status: newStatus } : report)))
      setMessage("Status updated successfully")
    } catch (err) {
      console.error("error updating status", err)
      setMessage("Failed to update status")
    }
  }

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.reported_by.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reported_user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reason.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "all" || report.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "reviewed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock size={12} />
      case "reviewed":
        return <Shield size={12} />
      case "resolved":
        return <CheckCircle size={12} />
      default:
        return <Ban size={12} />
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-900">
      <AdminSideBar />
      <div className="flex-1 p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Report Management</h1>
              <p className="text-slate-400">Review and manage user reports</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search reports..."
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
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Spinner />
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="mx-auto text-slate-600 mb-4" size={48} />
              <h3 className="text-lg font-medium text-slate-300 mb-2">
                {searchTerm || filterStatus !== "all" ? "No reports match your filters" : "No reports found"}
              </h3>
              <p className="text-slate-500">
                {reports.length === 0 ? "No reports have been submitted yet" : "Try adjusting your search or filters"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-700/50 border-b border-slate-600">
                    <th className="text-left px-6 py-4 text-slate-300 font-medium">
                      <div className="flex items-center gap-2">
                        <User size={16} />
                        Reported By
                      </div>
                    </th>
                    <th className="text-left px-6 py-4 text-slate-300 font-medium">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={16} />
                        Reason
                      </div>
                    </th>
                    <th className="text-left px-6 py-4 text-slate-300 font-medium">
                      <div className="flex items-center gap-2">
                        <FileText size={16} />
                        Description
                      </div>
                    </th>
                    <th className="text-left px-6 py-4 text-slate-300 font-medium">
                      <div className="flex items-center gap-2">
                        <User size={16} />
                        Reported User
                      </div>
                    </th>
                    <th className="text-left px-6 py-4 text-slate-300 font-medium">
                      <div className="flex items-center gap-2">
                        <Shield size={16} />
                        Status
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report, index) => (
                    <tr
                      key={report.id}
                      className={`border-b border-slate-700 hover:bg-slate-700/30 transition-colors ${
                        index % 2 === 0 ? "bg-slate-800/50" : "bg-slate-800/20"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                            <User size={16} className="text-slate-400" />
                          </div>
                          <div>
                            <span className="text-white font-medium">{report.reported_by.username}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                          {report.reason}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="text-slate-300 text-sm truncate" title={report.description}>
                            {report.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                            <User size={16} className="text-slate-400" />
                          </div>
                          <div>
                            <span className="text-white font-medium">{report.reported_user.username}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium border transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getStatusColor(report.status)}`}
                          value={report.status}
                          onChange={(e) => handleStatusChange(report.id, e.target.value)}
                        >
                          <option value="pending" disabled={report.status !=='pending'}>Pending</option>
                          <option value="reviewed" disabled={report.status === 'resolved'}>Reviewed</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Results count */}
        {!loading && filteredReports.length > 0 && (
          <div className="mt-4 text-slate-400 text-sm">
            Showing {filteredReports.length} of {reports.length} reports
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div
            className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
              message.includes("successfully")
                ? "bg-green-100 border border-green-400 text-green-700"
                : "bg-red-100 border border-red-400 text-red-700"
            }`}
          >
            <div className="flex items-center gap-2">
              {message.includes("successfully") ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
              {message}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReportManagement
