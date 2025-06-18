import axios from "axios"
import React from "react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function OtpVerification() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [cooldown, setCooldown] = useState(0)
  const [message, setMessage] = useState("")
  const email = localStorage.getItem("emailForOtp")
  const navigate = useNavigate()

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1)
      }, 1000)
    }

    return () => clearInterval(timer)
  }, [cooldown])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const otpString = otp.join("")
    try {
      const response = await axios.post("http://localhost:8000/verify_otp/", { email, otp: otpString })
      setMessage(response.data.message)
      localStorage.setItem('isAuthenticated','true')//imp
      localStorage.removeItem('emailForOtp')//imp
      setTimeout(() => {
        navigate("/home")
      }, 1000)
    } catch (error) {
      setMessage(error.response?.data?.error || "verification failed")
    }
  }

  const handleResend = async () => {
    try {
      console.log("Email for resend:", email)
      const response = await axios.post("http://localhost:8000/resend_otp/", { email })
      setMessage(response.data.message)
      setCooldown(60)
    } catch (error) {
      setMessage(error.response?.data?.error || "resend failed")
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
            <p className="text-slate-400 text-sm">Please enter the OTP to continue.</p>
          </div>

         
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center">
              <h2 className="text-white text-lg font-semibold mb-6">Enter Verification Code</h2>

              <div className="flex justify-center gap-3 mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const newOtp = [...otp]
                      newOtp[index] = e.target.value
                      setOtp(newOtp)
                    }}
                    className="w-12 h-12 bg-slate-700/50 border-2 border-white rounded-lg text-white text-center text-xl font-semibold focus:border-blue-400 focus:outline-none transition-colors duration-200"
                  />
                ))}
              </div>
            </div>

            <div className="text-center">
              <span className="text-slate-400 text-sm">
                {"Didn't receive the code? "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0}
                  className={`font-semibold transition-colors duration-200 ${
                    cooldown > 0 ? "text-slate-500 cursor-not-allowed" : "text-blue-400 hover:text-blue-300"
                  }`}
                >
                  {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend"}
                </button>
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              Continue
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full py-3 text-white font-semibold hover:text-slate-300 transition-colors duration-200"
            >
              Back
            </button>
          </form>

          {/* Message */}
          {message && (
            <div
              className={`mt-4 p-3 rounded-lg text-sm text-center ${
                message.includes("successful") || message.includes("sent")
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

export default OtpVerification

