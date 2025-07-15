import { useState } from "react"
import axiosInstance from "../api/axiosInstance"
import { useLocation, useNavigate } from "react-router-dom"
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
  LogOut,
  Menu,
  X,
} from "lucide-react"

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { name: "Users Management", icon: Users, path: "/admin/user-management" },
  { name: "Challenge Management", icon: Trophy, path: "/admin/challenge-management" },
  { name: "Level Management", icon: BarChart3, path: "/admin/level-management" },
  { name: "Plans Management", icon: CreditCard, path: "/admin/plan-management" },
  { name: "Report Management", icon: FileText, path: "/admin/report-management" },
  { name: "Group Management", icon: UserCheck, path: "#" },
  { name: "Badge Management", icon: Award, path: "#" },
  { name: "Notify Management", icon: Bell, path: "#" },
]

function AdminSideBar() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleNavigation = (path) => {
    navigate(path)
    setIsOpen(false) // Close sidebar on mobile after navigation
  }

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/logout/", {})
      navigate("/adminlogin")
    } catch (error) {
      console.error("Logout Failed", error)
    } finally {
      localStorage.removeItem("isAdmin")
      localStorage.removeItem("username")
    }
  }

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 text-white rounded-lg shadow-lg hover:bg-slate-700 transition-colors"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-40 w-80 h-screen bg-slate-800 text-white flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-white">Admin Panel</h1>
            {/* Close button for mobile */}
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.path
              return (
                <li key={index}>
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white hover:shadow-md"
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">{item.name}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User Info Section (Optional) */}
        <div className="p-4 border-t border-slate-700">
          {/* <div className="flex items-center space-x-3 px-4 py-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin User</p>
              <p className="text-xs text-slate-400 truncate">admin@example.com</p>
            </div>
          </div> */}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition-all duration-200 hover:shadow-lg"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  )
}

export default AdminSideBar
