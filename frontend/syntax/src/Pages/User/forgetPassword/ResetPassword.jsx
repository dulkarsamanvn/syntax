import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function ResetPassword() {
    const [password,setPassword]=useState('')
    const [confirmPassword,setConfirmPassword]=useState('')
    const [loading,setLoading]=useState(false)
    const [message,setMessage]=useState('')
    const navigate=useNavigate()

    const API_URL=import.meta.env.VITE_API_URL

    const email=localStorage.getItem('resetEmail')

    const handleSubmit=async(e)=>{
        e.preventDefault()

        if(!email){
            setMessage("Email not found. Please start from Forgot Password.")
            return
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;
        if (!passwordRegex.test(password)) {
            setMessage("Password must be at least 8 characters, include 1 uppercase letter and 1 special character.")
            return;
        }

        if (!password || !confirmPassword) {
            setMessage("Both password fields are required.")
            return
        }

        if (password !== confirmPassword) {
            setMessage("Passwords do not match.")
            return
        }
        setLoading(true)
        setMessage("")

        try{
            const res=await axios.post(`${API_URL}/reset-password/`,{
                email,
                password
            },{withCredentials:true})
            setMessage(res.data.message)
            localStorage.removeItem("resetEmail")

            setTimeout(() => {
                navigate('/login')
            }, 1000);
        }catch(err){
            setMessage(err.response?.data?.error || "Reset failed. Try again.")
        }finally{
            setLoading(false)
        }
    }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-slate-700/50">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img src="/images/syntax_logo.png" alt="SYN TAX Logo" className="w-25 h-24 object-contain" />
            </div>
            <h2 className="text-white text-2xl font-bold mb-2">Reset Password</h2>
            <p className="text-slate-400 text-sm">Enter your new password</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-4 bg-transparent border-2 border-white rounded-2xl text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none transition-colors duration-200"
              disabled={loading}
              required
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-4 bg-transparent border-2 border-white rounded-2xl text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none transition-colors duration-200"
              disabled={loading}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          {message && (
            <div
              className={`mt-4 p-3 rounded-lg text-sm text-center ${
                message.toLowerCase().includes("success")
                  ? "bg-green-900/50 text-green-300 border border-green-700/50"
                  : "bg-red-900/50 text-red-300 border border-red-700/50"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
