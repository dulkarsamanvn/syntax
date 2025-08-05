import { useEffect, useState } from "react"
import AdminSideBar from "../../Components/AdminSideBar"
import axiosInstance from "@/api/axiosInstance"
import { Card, CardContent } from "@/Components/ui/Card"
import Spinner from "@/Components/Spinner"
import { BarChart3, FileText, Users, Trophy, DollarSign } from "lucide-react"
import { useNavigate } from "react-router-dom"

function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const fetchStats = async () => {
    try {
      setLoading(true)
      const res = await axiosInstance.get("/dashboard/stats/")
      setStats(res.data)
    } catch (err) {
      console.error("error fetching stats", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const handleDownloadReport=async()=>{
    try{
      const res=await axiosInstance.get('/dashboard/download-report/',{
        responseType:'blob'
      })
      const blob=new Blob([res.data],{type:'text/csv'})
      const url=window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href=url
      link.setAttribute("download", "report.csv")
      document.body.appendChild(link)
      link.click()
      link.remove()
    }catch(err){
      console.error('failed to download report',err)
    }
  }


  return (
    <div className="flex min-h-screen bg-slate-900">
      <AdminSideBar />
      <div className="flex-1 p-6 overflow-hidden">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
              <p className="text-slate-400">Monitor and manage your platform performance.</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate("/admin/analytics")}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all duration-200"
              >
                <BarChart3 className="w-5 h-5" />
                Analytics Dashboard
              </button>
              <button onClick={handleDownloadReport} className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-all duration-200">
                <FileText className="w-5 h-5" />
                Generate Report
              </button>
            </div>
          </div>
        </div>

        {loading || !stats ? (
          <div className="flex justify-center items-center py-12">
            <Spinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-190px)] overflow-y-auto pr-2">
            {/* User Metrics Card */}
            <Card className="bg-slate-800 border-slate-700 hover:bg-slate-700/50 transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">User Metrics</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                    <p className="text-slate-400 text-sm mb-1">Total Users</p>
                    <p className="text-2xl font-bold text-white">{stats.total_users?.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                    <p className="text-slate-400 text-sm mb-1">Active Users</p>
                    <p className="text-2xl font-bold text-green-400">{stats.active_users?.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                    <p className="text-slate-400 text-sm mb-1">Premium Users</p>
                    <p className="text-2xl font-bold text-amber-400">{stats.premium_users?.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                    <p className="text-slate-400 text-sm mb-1">Churned Users</p>
                    <p className="text-2xl font-bold text-red-400">{stats.churned_users?.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Challenge & Activity Metrics Card */}
            <Card className="bg-slate-800 border-slate-700 hover:bg-slate-700/50 transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <Trophy className="w-6 h-6 text-purple-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Challenge & Activity</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                    <p className="text-slate-400 text-sm mb-1">Total Challenges</p>
                    <p className="text-2xl font-bold text-purple-400">{stats.total_challenges?.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                    <p className="text-slate-400 text-sm mb-1">Total Attempts</p>
                    <p className="text-2xl font-bold text-cyan-400">{stats.total_attempts?.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                    <p className="text-slate-400 text-sm mb-1">Weekly Attempts</p>
                    <p className="text-2xl font-bold text-indigo-400">{stats.attempts_this_week?.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                    <p className="text-slate-400 text-sm mb-1">Completion Rate</p>
                    <p className="text-2xl font-bold text-yellow-400">{stats.avg_completion_rate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Metrics Card */}
            <Card className="bg-slate-800 border-slate-700 hover:bg-slate-700/50 transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Revenue Metrics</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <p className="text-slate-400 text-sm mb-1">Weekly Revenue</p>
                    <p className="text-3xl font-bold text-green-400">₹{stats.weekly_revenue?.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 mt-1">This week</p>
                  </div>
                  <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                    <p className="text-slate-400 text-sm mb-1">Monthly Revenue</p>
                    <p className="text-3xl font-bold text-violet-400">₹{stats.monthly_revenue?.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 mt-1">This month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Challenge Performance Card */}
            <Card className="bg-slate-800 border-slate-700 hover:bg-slate-700/50 transition-all duration-200">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-pink-500/20 rounded-lg">
                    <Trophy className="w-6 h-6 text-pink-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Most Attempted</h2>
                </div>

                {/* Most Attempted Challenge */}
                <div className="mb-4">
                  {/* <h3 className="text-lg font-semibold text-white mb-2">Most Attempted</h3> */}
                  {stats.most_attempted ? (
                    <div className="p-4 bg-slate-700/50 rounded-lg ">
                      <h4 className="text-lg font-bold text-white mb-2">{stats.most_attempted.challenge__title}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-pink-400">
                          {stats.most_attempted.attempt_count?.toLocaleString()}
                        </span>
                        <span className="text-slate-400">attempts</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400 text-center py-4">No data available</p>
                  )}
                </div>

                {/* Top 3 Challenges */}
                {/* <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Top 3 Challenges</h3>
                  <div className="space-y-2">
                    {stats.top_attempted?.length > 0 ? (
                      stats.top_attempted.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                idx === 0
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : idx === 1
                                    ? "bg-gray-500/20 text-gray-400"
                                    : "bg-orange-500/20 text-orange-400"
                              }`}
                            >
                              {idx + 1}
                            </div>
                            <span className="text-white font-medium">{item.challenge__title}</span>
                          </div>
                          <span className="text-blue-400 font-semibold">{item.count} attempts</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400 text-center py-4">No data available</p>
                    )}
                  </div>
                </div> */}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
