import axios from "axios"
import React, { useRef } from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { GoogleLogin } from "@react-oauth/google"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const navigate = useNavigate()
  const googleLoginWrapperRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email) {
      setMessage("Email is required")
      return
    }
    if (!password) {
      setMessage("Password is required")
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setMessage("Enter a valid email address")
      return
    }
    try {
      const response = await axios.post(`${API_URL}/login/`, { email, password }, { withCredentials: true })

      localStorage.setItem("username", response.data.username)
      localStorage.setItem('isAuthenticated', 'true')
      setMessage("Login Successful")
      navigate("/home")
    } catch (error) {
      console.log("Error response:", error.response)
      const detail = error.response?.data?.detail
      if (detail === "Email not verified. A new OTP has been sent to your email.") {
        localStorage.setItem("emailForOtp", email)
        setMessage("New OTP sent")
        setTimeout(() => {
          navigate("/verify-otp")
        }, 1000)
      } else if (detail === "You have been blocked by the admin.") {
        setMessage("You have been blocked by the admin.")
      } else {
        setMessage(detail || "Login Failed")
      }
    }
  }


  const handleSuccess = async (credentialResponse) => {
    const token = credentialResponse.credential;
    try {
      const res = await axios.post(`${API_URL}/google/`, { token }, { withCredentials: true })
      console.log('Login Success', res.data)
      localStorage.setItem("username", res.data.username)
      localStorage.setItem('isAuthenticated', 'true')
      setMessage("Login Successful")
      navigate("/home")

    } catch (error) {

      const detail = error.response?.data?.detail
      const errorMessage = error.response?.data?.error

      if (error.response?.status === 403) {
        console.log('403 status detected - user blocked')
        setMessage(detail || "You have been blocked by the admin.");
      }

      else if (errorMessage === "Invalid token") {
        setMessage("Invalid or expired Google token.");
      }
      else if (detail) {
        setMessage(detail);
      }
      else {
        setMessage("Google Login Failed. Please try again.");
      }
    }
  }

  const handleError = () => {
    console.log('Google login failed');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-slate-700/50">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <img src="/images/syntax_logo.png" alt="SYN TAX Logo" className="w-25 h-24 object-contain" />
            </div>
          </div>

          <div className="space-y-3 mb-6">

            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              theme="filled_white"
              size="large"
              width="100%"
              text="continue_with"
              shape="rectangular"

            />

          </div>

          <div className="text-center mb-6">
            <span className="text-slate-400 text-sm">or</span>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
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
              Sign In.
            </button>
          </form>

          {/* Message */}
          {message && (
            <div
              className={`mt-4 p-3 rounded-lg text-sm text-center ${message.includes("Successful") || message.includes("sent")
                ? "bg-green-900/50 text-green-300 border border-green-700/50"
                : "bg-red-900/50 text-red-300 border border-red-700/50"
                }`}
            >
              {message}
            </div>
          )}
          <div className="text-center mt-8 space-y-4">
            <div>
              <span className="text-slate-400 text-sm">
                {"don't have an account? "}
                <button
                  onClick={() => navigate("/signup")}
                  className="text-white font-semibold hover:text-blue-400 transition-colors duration-200"
                >
                  Create a account
                </button>
              </span>
            </div>
            <div>
              <button
                onClick={() => navigate("/forget-password")}
                className="text-white font-semibold hover:text-blue-400 transition-colors duration-200"
              >
                Forgot password?
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
