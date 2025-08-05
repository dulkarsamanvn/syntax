import axiosInstance from "@/api/axiosInstance"
import { useNavigate } from "react-router-dom"
import { Button } from "@/Components/ui/Button.jsx"
import { ArrowLeft, ChevronDown, Shield, Bell, Crown, LogOut } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/Card.jsx"
import { useEffect, useState } from "react"
import Spinner from "@/Components/Spinner"
import ChallengeRequestModal from "@/Components/ChallengeRequestModal"


function SettingsRequest() {
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(false)
    const [showModal,setShowModal]=useState(false)
    const navigate = useNavigate()


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

    const openModal=()=>{
        setShowModal(true)
    }

    const closeModal=()=>{
        setShowModal(false)
        fetchData()
    }


    const fetchData = async () => {
        try {
            setLoading(true)
            const res = await axiosInstance.get('/challenge/challenge-requests/')
            setHistory(res.data?.results || [])
        } catch (err) {
            console.error('error fetching request history', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])


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
                                            className="bg-slate-700/70 rounded-lg border border-slate-600/50"
                                        >
                                            <div className="flex items-center justify-between p-3 cursor-pointer" onClick={() => navigate("/settings/requests")}>
                                                <div className="flex items-center gap-3">
                                                    <Bell className="w-4 h-4 text-yellow-400" />
                                                    <span className="text-white font-medium">Requests</span>
                                                </div>
                                                <ChevronDown className="w-4 h-4 text-white" />
                                            </div>
                                        </div>


                                        <div
                                            onClick={() => navigate('/settings')}
                                            className="flex items-center justify-between p-3 hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200 group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Crown className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                                                <span className="text-slate-300 group-hover:text-white transition-colors">Premium</span>
                                            </div>
                                            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
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
                                <h1 className="text-3xl font-bold text-white mb-2">Challenge Requests</h1>
                                <p className="text-slate-400">Submit a new challenge idea or track your previous requests</p>
                            </div>

                            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm shadow-xl mb-8">
                                <CardContent className="p-8">
                                    <div className="text-slate-300 flex items-center justify-between">
                                        <span >
                                            Submit a New Challenge Request
                                        </span>
                                        <Button
                                            className=" bg-gradient-to-b from-blue-600 to-violet-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                                            onClick={openModal}
                                        >
                                            Add Request
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>




                            {/* Membership History */}
                            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm shadow-xl">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-xl font-bold text-white">Previous Requests</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {history.length > 0 ? (
                                        <div className="space-y-4">
                                            {history.map((item, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between py-4 border-b border-slate-700/50 hover:bg-slate-700/20 rounded-lg px-4 -mx-4 transition-colors"
                                                >
                                                    <div>
                                                        <p className="text-white font-semibold">{item.title}</p>
                                                        <p className="text-slate-400 text-sm mt-1">{item.description}</p>
                                                    </div>
                                                    <span
                                                        className={`px-3 py-1 text-sm rounded-full font-medium ${item.status === 'approved'
                                                            ? 'bg-green-800 text-green-300'
                                                            : item.status === 'rejected'
                                                                ? 'bg-red-800 text-red-300'
                                                                : 'bg-yellow-800 text-yellow-300'
                                                            }`}
                                                    >
                                                        {item.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-slate-400">No challenge requests submitted yet.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            )}
            <ChallengeRequestModal 
                show={showModal}
                onCancel={closeModal}
            />
        </div>
    )
}

export default SettingsRequest
