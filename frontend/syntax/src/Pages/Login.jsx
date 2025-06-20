import axios from "axios"
import React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { GoogleLogin } from "@react-oauth/google"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post("http://localhost:8000/login/", { email, password },{withCredentials:true})
      
      localStorage.setItem("username", response.data.username)
      localStorage.setItem('isAuthenticated','true')
      setMessage("Login Successful")
      navigate("/home")
    } catch (error) {
      console.log("Error response:", error.response)
      const detail = error.response?.data?.detail
      if (detail == "Email not verified. A new OTP has been sent to your email.") {
        localStorage.setItem("emailForOtp", email)
        setMessage("New OTP sent")
        setTimeout(() => {
          navigate("/verify-otp")
        }, 1000)
      } else {
        setMessage(detail || "Login Failed")
      }
    }
  }

  const handleSuccess=async(credentialResponse)=>{
    const token=credentialResponse.credential;
    try{
      const res=await axios.post('http://localhost:8000/google/',{token},{withCredentials:true})
      console.log('Login Success',res.data)
      localStorage.setItem("username", res.data.username)
      localStorage.setItem('isAuthenticated','true')
      setMessage("Login Successful")
      navigate("/home")

    }catch(error){
      console.error('Login Error:', error.response?.data || error.message)
    }
  }

  const handleError=()=>{
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
            {/* <div className="w-full py-3 px-4 bg-transparent border-2 border-white rounded-2xl text-white font-medium hover:border-slate-500 transition-colors duration-200 flex items-center justify-center gap-3">
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </div> */}

             <GoogleLogin
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
            />

            <button className="w-full py-3 px-4 bg-transparent border-2 border-white rounded-2xl text-white font-medium hover:border-slate-500 transition-colors duration-200 flex items-center justify-center gap-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Continue with Github
            </button>
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
              className={`mt-4 p-3 rounded-lg text-sm text-center ${
                message.includes("Successful") || message.includes("sent")
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
                onClick={() => navigate("/forgot-password")}
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
