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
      const response = await axios.post("http://localhost:8000/login/", { email, password }, { withCredentials: true })

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
      const res = await axios.post('http://localhost:8000/google/', { token }, { withCredentials: true })
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

            {/* <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              render={(renderProps) => (
                <button
                  onClick={renderProps.onClick}
                  disabled={renderProps.disabled}
                  className="w-full py-3 px-4 bg-transparent border-2 border-white rounded-2xl text-white font-medium hover:border-slate-500 transition-colors duration-200 flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>
              )}
            /> */}
            <div className="relative w-full">
              <div ref={googleLoginWrapperRef} className="absolute inset-0 opacity-0">
                <GoogleLogin
                  onSuccess={handleSuccess}
                  onError={handleError}
                />
              </div>

              <button
                onClick={() => {
                  const btn = googleLoginWrapperRef.current?.querySelector('div[role="button"]');
                  if (btn) btn.click();
                }}
                className="w-full py-3 px-4 bg-transparent border-2 border-white rounded-2xl text-white font-medium hover:border-slate-500 transition-colors duration-200 flex items-center justify-center gap-3 relative z-10"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
            </div>
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
