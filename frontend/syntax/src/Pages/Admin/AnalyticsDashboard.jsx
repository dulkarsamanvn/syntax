"use client"

import { useEffect, useState } from "react"
import AdminSideBar from "../../Components/AdminSideBar"
import axiosInstance from "@/api/axiosInstance"
import { Card, CardContent } from "@/Components/ui/card"
import Spinner from "@/Components/Spinner"
import { ArrowLeft, TrendingUp, PieChart, Users, DollarSign } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { useNavigate } from "react-router-dom"

function AnalyticsDashboard() {
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


  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString("en-IN", { month: "short", day: "numeric" })

//   if(loading || !stats){
//     return (
//     <div className="min-h-screen flex items-center justify-center bg-slate-900">
//       <Spinner />
//     </div>
//   )
//   }
  return (
    <div className="flex min-h-screen bg-slate-900">
      <AdminSideBar />
      <div className="flex-1 p-6 overflow-hidden">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-3">Analytics Dashboard</h1>
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-b from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>
          </div>
        </div>

        {loading || !stats? (
          <div className="flex justify-center items-center py-12">
            <Spinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-180px)] overflow-y-auto">
            {/* Revenue Trend Chart */}
            <Card className="bg-slate-800 border-slate-700 hover:bg-slate-700/50 transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Revenue Trend</h2>
                    <p className="text-slate-400 text-sm">Last 30 Days</p>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.revenue_trend?.map((d) => ({ ...d, day: formatDate(d.day) })) || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #475569",
                          borderRadius: "8px",
                          color: "#f1f5f9",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Active Users Trend Chart */}
            <Card className="bg-slate-800 border-slate-700 hover:bg-slate-700/50 transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Active Users Trend</h2>
                    <p className="text-slate-400 text-sm">Last 30 Days</p>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.active_users_trend?.map((d) => ({ ...d, day: formatDate(d.day) })) || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #475569",
                          borderRadius: "8px",
                          color: "#f1f5f9",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Plan Revenue Distribution */}
            <Card className="bg-slate-800 border-slate-700 hover:bg-slate-700/50 transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <DollarSign className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Plan Revenue Distribution</h2>
                    <p className="text-slate-400 text-sm">Revenue by subscription plans</p>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={stats.plan_distribution || []}
                        dataKey="total"
                        nameKey="plan__name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={40}
                        paddingAngle={5}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {(stats.plan_distribution || []).map((_, index) => (
                          <Cell key={index} fill={["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #475569",
                          borderRadius: "8px",
                          color: "#f1f5f9",
                        }}
                      />
                      <Legend wrapperStyle={{ color: "#94a3b8", fontSize: "14px" }} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* User Breakdown */}
            <Card className="bg-slate-800 border-slate-700 hover:bg-slate-700/50 transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-amber-500/20 rounded-lg">
                    <PieChart className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">User Breakdown</h2>
                    <p className="text-slate-400 text-sm">Premium vs Free users</p>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={[
                          { name: "Premium Users", value: stats.user_breakdown?.premium || 0 },
                          { name: "Free Users", value: stats.user_breakdown?.free || 0 },
                        ]}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={40}
                        paddingAngle={5}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill="#f59e0b" />
                        <Cell fill="#10b981" />
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #475569",
                          borderRadius: "8px",
                          color: "#ffffff",
                        }}
                      />
                      <Legend wrapperStyle={{ color: "#94a3b8", fontSize: "14px" }} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default AnalyticsDashboard
