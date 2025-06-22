import React from 'react'
import axiosInstance from '../api/axiosInstance'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Trophy,
  BarChart3,
  CreditCard,
  FileText,
  UserCheck,
  Award,
  Bell,
  LogOut
} from "lucide-react"

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { name: "Users Management", icon: Users, path: "/admin/user-management" },
  { name: "Challenge Management", icon: Trophy, path: "#" },
  { name: "Level Management", icon: BarChart3, path: "#" },
  { name: "Plans Management", icon: CreditCard, path: "#" },
  { name: "Report Management", icon: FileText, path: "#" },
  { name: "Group Management", icon: UserCheck, path: "#" },
  { name: "Badge Management", icon: Award, path: "#" },
  { name: "Notify Management", icon: Bell, path: "#" },
]


function AdminSideBar() {
    const navigate=useNavigate()
    const location=useLocation()

    const handleNavigation = (path) => {
        navigate(path)
    }
    const handleLogout=async()=>{
        try{
        await axiosInstance.post('/logout/',{},{withCredentials:true})
        navigate('/adminlogin')
      }catch(error){
        console.error('Logout Failed',error)
      }finally{
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('username');
        }
    }
  return (
   <div className="w-80 h-screen bg-slate-800 text-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-semibold text-white">Admin Panel</h1>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 ">
        <ul className="space-y-2 ">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path
            return (
              <li key={index}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors duration-200  ${
                    isActive
                      ? "bg-slate-700 text-white border-l-4 border-blue-500"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.name}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition-colors duration-200">
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  )
}

export default AdminSideBar
