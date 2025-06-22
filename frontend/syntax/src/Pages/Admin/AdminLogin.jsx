import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const navigate = useNavigate()

  const handleAdminLogin = async (e) => {
    e.preventDefault()
    console.log("Sending login:", { email, password })
    try {
      const response = await axios.post(
        "http://localhost:8000/adminlogin/",
        { email, password },
        { withCredentials: true },
      )
      localStorage.setItem("isAdmin", "true")
      localStorage.setItem("username", response.data.username)
      setMessage("Login Successful")
      navigate("/admin/dashboard")
    } catch (error) {
      const detail = error.response?.data?.detail || "Login Failed"
      setMessage(detail)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-slate-700/50">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Admin Login</h1>
            <p className="text-slate-400 text-sm">Access the admin dashboard</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div>
              <input
                type="email"
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 bg-transparent border-2 border-white rounded-2xl text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none transition-colors duration-200"
                required
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 bg-transparent border-2 border-white rounded-2xl text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none transition-colors duration-200"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              Admin Login
            </button>
          </form>

          {/* Message */}
          {message && (
            <div
              className={`mt-6 p-4 rounded-2xl text-sm text-center font-medium ${
                message.includes("Successful")
                  ? "bg-green-900/50 text-green-300 border border-green-700/50"
                  : "bg-red-900/50 text-red-300 border border-red-700/50"
              }`}
            >
              {message}
            </div>
          )}

          <div className="text-center mt-8">
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
