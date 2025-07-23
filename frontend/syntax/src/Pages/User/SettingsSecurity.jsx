import axiosInstance from "@/api/axiosInstance"
import { useNavigate } from "react-router-dom"
import { Button } from "@/Components/ui/button"
import { ArrowLeft, ChevronDown, Shield, Bell, Crown, LogOut, Eye, EyeOff, Lock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useEffect, useState } from "react"
import Spinner from "@/Components/Spinner"
import toast from "react-hot-toast"

function SettingsSecurity() {
    const [loading, setLoading] = useState(false)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })
    const [updating, setUpdating] = useState(false)
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

    const handlePasswordChange = (field, value) => {
        setPasswordData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleUpdatePassword = async () => {

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New passwords don't match")
            return
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;
        if (!passwordRegex.test(passwordData.newPassword)) {
            toast.error("Password must be at least 8 characters, include 1 uppercase letter and 1 special character.")
            return;
        }

        try {
            setUpdating(true)
            await axiosInstance.post("/profile/change-password/", {
                current_password: passwordData.currentPassword,
                new_password: passwordData.newPassword,
            })
            toast.success("Password updated successfully")
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            })
        } catch (error) {
            console.error("Password update failed", error)
            if (error.response?.data?.current_password) {
                toast.error(error.response.data.current_password[0])
            } else {
                toast.error("Failed to update password")
            }
        } finally {
            setUpdating(false)
        }
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
                                        {/* Security - Active State */}
                                        <div className="bg-slate-700/70 rounded-lg border border-slate-600/50">
                                            <div className="flex items-center justify-between p-3 cursor-pointer">
                                                <div className="flex items-center gap-3">
                                                    <Shield className="w-4 h-4 text-white" />
                                                    <span className="text-white font-medium">Security</span>
                                                </div>
                                                <ChevronDown className="w-4 h-4 text-white" />
                                            </div>
                                        </div>
                                        <div
                                            onClick={() => navigate("/settings/notifications")}
                                            className="flex items-center justify-between p-3 hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200 group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Bell className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                                                <span className="text-slate-300 group-hover:text-white transition-colors">Notifications</span>
                                            </div>
                                            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                                        </div>
                                        <div
                                            onClick={() => navigate("/settings")}
                                            className="flex items-center justify-between p-3 hover:bg-slate-700/50 rounded-lg cursor-pointer transition-all duration-200 group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Crown className="w-4 h-4 text-yellow-400 group-hover:text-yellow-300 transition-colors" />
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
                        <div className="flex-1 min-w-0 ">
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-2">
                                    <Lock className="w-8 h-8 text-white" />
                                    <h1 className="text-3xl font-bold text-white">Security Settings</h1>
                                </div>
                                <p className="text-slate-400">Manage your account security and authentication settings</p>
                            </div>

                            {/* Change Password Section */}
                            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm shadow-xl mb-8">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-xl font-bold text-white">Change Password</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="current-password" className="text-white font-medium">
                                            Current Password
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="current-password"
                                                type={showCurrentPassword ? "text" : "password"}
                                                placeholder="Enter current password"
                                                value={passwordData.currentPassword}
                                                onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                                                className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 pr-10"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            >
                                                {showCurrentPassword ? (
                                                    <EyeOff className="h-4 w-4 text-slate-400" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-slate-400" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="new-password" className="text-white font-medium">
                                            New Password
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="new-password"
                                                type={showNewPassword ? "text" : "password"}
                                                placeholder="Enter new password"
                                                value={passwordData.newPassword}
                                                onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                                                className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 pr-10"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                            >
                                                {showNewPassword ? (
                                                    <EyeOff className="h-4 w-4 text-slate-400" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-slate-400" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-password" className="text-white font-medium">
                                            Confirm Password
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="confirm-password"
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="Confirm new password"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                                                className="bg-slate-700/50 border-slate-600/50 text-white placeholder:text-slate-400 pr-10"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="h-4 w-4 text-slate-400" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-slate-400" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleUpdatePassword}
                                        disabled={
                                            updating ||
                                            !passwordData.currentPassword ||
                                            !passwordData.newPassword ||
                                            !passwordData.confirmPassword
                                        }
                                        className="bg-gradient-to-r from-blue-600 to-violet-700 hover:from-blue-700 hover:to-violet-800 text-white px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {updating ? "Updating..." : "Update Password"}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SettingsSecurity
