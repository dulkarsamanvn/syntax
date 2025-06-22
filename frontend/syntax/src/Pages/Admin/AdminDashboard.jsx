import React from 'react'
import AdminSideBar from '../../Components/AdminSideBar'

function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-slate-900">
      <AdminSideBar />

      <main className="flex-1 p-8 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-slate-400">Welcome to the admin dashboard. Monitor and manage your platform.</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard
