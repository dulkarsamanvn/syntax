import React from "react"
import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

function Signup() {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const navigate = useNavigate()

  const handleSignup = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post("http://localhost:8000/signup/", {
        email,
        username,
        password,
      })

      localStorage.setItem("emailForOtp", email)
      setMessage("Signup successful, redirecting to OTP verification")
      setTimeout(() => {
        navigate("/verify-otp")
      }, 1000)
    } catch (error) {
      console.error(error, "signup failed")
      setMessage("Signup failed. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-slate-700/50">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img src="/images/syntax_logo.png" alt="SYN TAX Logo" className="w-25 h-24 object-contain" />
            </div>
            <p className="text-slate-400 text-sm mt-4">Create an account to begin your journey into mastery</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-4 bg-transparent border-2 border-white rounded-2xl text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none transition-colors duration-200"
                required
              />
            </div>

            <div>
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 bg-transparent border-2 border-white rounded-2xl text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none transition-colors duration-200"
                required
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
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
              Continue
            </button>
          </form>

          {/* Message */}
          {message && (
            <div
              className={`mt-4 p-3 rounded-lg text-sm text-center ${message.includes("successful")
                  ? "bg-green-900/50 text-green-300 border border-green-700/50"
                  : "bg-red-900/50 text-red-300 border border-red-700/50"
                }`}
            >
              {message}
            </div>
          )}

          {/* Login Link */}
          <div className="text-center mt-8">
            <span className="text-slate-400 text-sm">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-white font-semibold hover:text-blue-400 transition-colors duration-200"
              >
                Login
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
