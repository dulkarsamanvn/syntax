import axiosInstance from "@/api/axiosInstance"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Trophy, ChevronDown, Shield, Bell, Crown, LogOut} from "lucide-react"
import { useEffect, useState } from "react"
import Spinner from "@/Components/Spinner"
import ConfirmModal from "@/Components/ConfirmModal"
import { format } from "date-fns"
import { Button } from "@/Components/ui/Button.jsx"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/Card.jsx"

function Settings() {
  const [current, setCurrent] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const navigate = useNavigate()

  const fetchData = async () => {
    setLoading(true)
    try {
      const [currentRes, historyRes] = await Promise.all([
        axiosInstance.get('/premium/check-subscription/'),
        axiosInstance.get('/premium/membership-history/')
      ])
      setCurrent(currentRes.data)
      setHistory(historyRes.data)
    } catch (err) {
      console.error('error fetching subscription details', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/logout/", {})
      navigate("/login")
    } catch (error) {
      console.error("Logout Failed", error)
    } finally {
      localStorage.removeItem("emailForOtp")
      localStorage.removeItem("isAuthenticated")
      localStorage.removeItem("username")
    }
  }

  const handleCancel = async () => {
    try {
      setCancelling(true)
      await axiosInstance.post('/premium/cancel-subscription/')
      await fetchData()
      setShowModal(false)
    } catch (err) {
      console.error('error cancelling subscription', err)
    } finally {
      setCancelling(false)
    }
  }

  const openModal = () => {
    setShowModal(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      {/* Navigation Bar */}
      <nav className="border-b border-slate-700/50 px-4 md:px-6 py-4 bg-slate-900/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-white hover:bg-slate-800/50 px-3 py-2 h-auto"
            onClick={() => navigate('/profile')}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">BACK</span>
          </Button>
          {/* <Settings className='w-4 h-4'/> */}
        </div>
      </nav>
      {loading ? (
        <Spinner />
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-8 max-w-7xl mx-auto">
            {/* Sidebar Card */}
            <div className="w-80 flex-shrink-0">
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm shadow-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-white">Settings</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <nav className="space-y-1 p-4">
                    <div
                      onClick={() => navigate("/settings/security")}
                      className="flex items-center justify-between p-3 hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <Shield className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                        <span className="text-slate-300 group-hover:text-white transition-colors">Security</span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                    <div 
                    onClick={()=>navigate('/settings/requests')}
                    className="flex items-center justify-between p-3 hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200 group">
                      <div className="flex items-center gap-3">
                        <Bell className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                        <span className="text-slate-300 group-hover:text-white transition-colors">Requests</span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                    </div>

                    <div className="bg-slate-700/70 rounded-lg border border-slate-600/50">
                      <div className="flex items-center justify-between p-3 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Crown className="w-4 h-4 text-yellow-400" />
                          <span className="text-white font-medium">Premium</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-700/50">
                      <div
                        onClick={handleLogout}
                        className="flex items-center gap-3 p-3 hover:bg-red-900/20 rounded-lg cursor-pointer text-red-400 hover:text-red-300 transition-all duration-200 group"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </div>
                    </div>
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Premium Membership</h1>
                <p className="text-slate-400">Manage your premium subscription and benefits</p>
              </div>

              {/* Premium Member Card */}
              {current?.is_premium ? (
                <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm shadow-xl mb-8">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                        <Trophy className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-1">{current.plan_name}</h2>
                        <p className="text-slate-400">Your premium membership is active since {current?.end_date ? format(new Date(current.end_date), "dd MMM yyyy") : "N/A"}</p>
                      </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      <div className="bg-slate-700/50 p-5 rounded-xl border border-slate-600/30 hover:bg-slate-700/70 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full shadow-sm"></div>
                          <span className="text-slate-200 font-medium">Unlimited Challenges</span>
                        </div>
                      </div>

                      <div className="bg-slate-700/50 p-5 rounded-xl border border-slate-600/30 hover:bg-slate-700/70 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full shadow-sm"></div>
                          <span className="text-slate-200 font-medium">Priority Support</span>
                        </div>
                      </div>

                      <div className="bg-slate-700/50 p-5 rounded-xl border border-slate-600/30 hover:bg-slate-700/70 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full shadow-sm"></div>
                          <span className="text-slate-200 font-medium">Exclusive Badges</span>
                        </div>
                      </div>

                      <div className="bg-slate-700/50 p-5 rounded-xl border border-slate-600/30 hover:bg-slate-700/70 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full shadow-sm"></div>
                          <span className="text-slate-200 font-medium">Performance Boost</span>
                        </div>
                      </div>
                    </div>
                    {current?.cancelled && (
                      <p className="text-yellow-400 font-medium mb-4">
                        You've cancelled your subscription. It remains active until{" "}
                        {format(new Date(current.end_date), "dd MMM yyyy")}.
                      </p>
                    )}
                    <Button
                      onClick={openModal}
                      disabled={current?.cancelled}
                      className={`bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg ${
                        current?.cancelled ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {cancelling ? 'Cancelling...' : 'Cancel Membership'}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm shadow-xl mb-8">
                  <CardContent className="p-8">
                    <div className="text-slate-300 flex items-center justify-between">
                      <span >
                      You don't have an active subscription.
                      </span>
                      <Button
                        className=" bg-gradient-to-b from-blue-600 to-violet-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                        onClick={() => navigate("/premium")}
                      >
                        Go Premium
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}


              {/* Membership History */}
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-white">Membership History</CardTitle>
                </CardHeader>
                {history.length > 0 ? (
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {history.map((item, index) => (
                        <div key={index} className="flex items-center justify-between py-4 border-b border-slate-700/50 hover:bg-slate-700/20 rounded-lg px-4 -mx-4 transition-colors">
                          <div>
                            <p className="text-white font-semibold">{item.plan_name}</p>
                            <p className="text-slate-400 text-sm mt-1">{item.duration_days} days</p>
                          </div>
                          <span className="text-green-400 font-semibold">₹ {item.price}</span>
                          <p className="text-sm">
                            {format(new Date(item.start_date), "dd MMM yyyy")} →{" "}
                            {format(new Date(item.end_date), "dd MMM yyyy")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                ) : (
                  <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm shadow-xl mb-8">
                  <CardContent className="p-8">
                    <div className="text-slate-300 flex items-center justify-between">
                      <span >
                      No Previous Subscriptions
                      </span>
                    </div>
                  </CardContent>
                </Card>
                )}

              </Card>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleCancel}
        actionText={`Are you sure you want to cancel your subscription?`}
      />
    </div>
  )
}

export default Settings
