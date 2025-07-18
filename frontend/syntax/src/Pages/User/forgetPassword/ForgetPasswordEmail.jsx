import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

function ForgetPasswordEmail() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email) {
      setMessage("Email is required")
      return
    }

    setIsLoading(true)
    setMessage("")

    try {
      const response = await axios.post("http://localhost:8000/forgot-password/", {email},{withCredentials:true})

      setMessage("Verification code sent to your email successfully")

      // Store email for next step if needed
      localStorage.setItem("resetEmail", email)

      // Navigate to verification page after delay
      setTimeout(() => {
        navigate("/verify-reset-code")
      }, 1000)
    } catch (error) {
      console.error(error, "forgot password failed")
      const response = error.response

      if (response?.data?.email) {
        setMessage(`Email: ${response.data.email[0]}`)
      } else if (response?.data?.detail) {
        setMessage(response.data.detail)
      } else if (response?.data?.message) {
        setMessage(response.data.message)
      } else {
        setMessage("Failed to send verification code. Please try again.")
      }
    } finally {
      setIsLoading(false)
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
            <h2 className="text-white text-2xl font-bold mb-2">Forgot Password</h2>
            <p className="text-slate-400 text-sm">Enter your email to receive a verification code</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 bg-transparent border-2 border-white rounded-2xl text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none transition-colors duration-200"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              {isLoading ? "Sending..." : "Send Verification Code"}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={isLoading}
              className="w-full py-3 text-white font-semibold hover:text-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors duration-200"
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

          {/* Login Link */}
          <div className="text-center mt-8">
            <span className="text-slate-400 text-sm">
              Remember your password?{" "}
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

export default ForgetPasswordEmail
