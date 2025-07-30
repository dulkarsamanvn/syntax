import React, { useEffect, useState } from 'react'
import axiosInstance from '@/api/axiosInstance'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Camera, Github, Twitter, MessageSquare, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

function EditProfile() {
    const [emailNotifications, setEmailNotifications] = useState(true)
    const [publicProfile, setPublicProfile] = useState(true)
    const [showActivity, setShowActivity] = useState(true)

    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        username: '',
        profile_photo: null,
        profile_photo_url: '',
        email: '',
        tagline: '',
        bio: '',
        github_url: 'https://github.com/',
        twitter_url: 'https://twitter.com/',
        discord: 'https://discord.com/'
        })

    const [message, setMessage] = useState('')

    useEffect(() => {
        const fetchProfile=async()=>{
            try{
                const [profileRes,profileDetailsRes]=await Promise.all([
                    axiosInstance.get('/profile/',{withCredentials:true}),
                    axiosInstance.get('/profile/profile-details/',{withCredentials:true})
                ])
                setFormData(prev=>({
                    ...prev,
                    username: profileRes.data.username,
                    email: profileRes.data.email,
                    profile_photo_url: profileRes.data.profile_photo_url || "/placeholder.svg?height=96&width=96",
                    tagline: profileDetailsRes.data.tagline || '',
                    bio: profileDetailsRes.data.bio || '',
                    github_url: profileDetailsRes.data.github_url || 'https://github.com/',
                    twitter_url: profileDetailsRes.data.twitter_url || 'https://twitter.com/',
                    discord: profileDetailsRes.data.discord || 'https://discord.com/'
                }))
            }catch(err){
                console.error('Failed to fetch profile',err)
            }
        }

        fetchProfile()
    }, [])


    const handleChange = (e) => {
        const { name, files, value } = e.target
        if (name === 'profile_photo') {
            setFormData(prev => ({ ...prev, profile_photo: files[0], profile_photo_url: URL.createObjectURL(files[0]) }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const form = new FormData()
        form.append('username', formData.username)
        if (formData.profile_photo) {
            form.append('profile_photo', formData.profile_photo)
        }
        try {
            await axiosInstance.patch('/profile/', form, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            await axiosInstance.patch('/profile/profile-details/',{
                tagline: formData.tagline,
                bio: formData.bio,
                github_url: formData.github_url,
                twitter_url: formData.twitter_url,
                discord: formData.discord
            },{withCredentials:true})
            setMessage('profile Updated Successfully')
            navigate('/profile', { state: { refresh: true } })
        } catch (error) {
            console.error('update failed', error)
            setMessage('update failed')
        }

    }
    return (
        <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
            <nav className="border-b border-slate-700/50 px-4 md:px-6 py-4 bg-slate-900/90 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                    {/* Back Button - Left Side */}
                    <Button
                        variant="ghost"
                        className="flex items-center gap-2 text-white hover:bg-slate-800/50 px-3 py-2 h-auto"
                        onClick={() => navigate('/profile')}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">BACK</span>
                    </Button>

                    {/* Save Changes Button - Right Side */}
                    <Button
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200 shadow-lg hover:shadow-xl"
                        onClick={handleSubmit}
                    >
                        Save Changes
                    </Button>
                </div>
            </nav>
            <div className="max-w-4xl mx-auto p-6 space-y-6">
                {/* Profile Avatar */}
                <div className="flex justify-center">
                    <div className="relative group">
                        {/* Profile Image */}
                        <div className="w-24 h-24 rounded-full bg-slate-700 overflow-hidden">
                            <img
                                src={formData.profile_photo_url || "/placeholder.svg?height=96&width=96"}
                                alt="Profile Avatar"
                                className="w-full h-full object-cover"
                            />

                        </div>

                        {/* Hidden File Input */}
                        <input
                            id="profile-photo-input"
                            type="file"
                            name="profile_photo"
                            accept="image/*"
                            onChange={handleChange}
                            className="hidden"
                        />

                        {/* Camera Button */}
                        <label htmlFor="profile-photo-input">
                            <div className="absolute bottom-0 right-0 w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center hover:bg-slate-500 transition-colors cursor-pointer">
                                <Camera className="w-4 h-4 text-white" />
                            </div>
                        </label>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <div className="bg-slate-800/50 rounded-xl p-6 space-y-6">
                        <h2 className="text-xl font-semibold text-white">Personal Information</h2>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="displayName" className="text-sm text-gray-400 mb-2 block">
                                    Display Name
                                </Label>
                                <Input
                                    type="text" name='username' value={formData.username} onChange={handleChange}
                                    className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <Label htmlFor="tagline" className="text-sm text-gray-400 mb-2 block">
                                    Tagline
                                </Label>
                                <Input
                                    id="tagline"
                                    name="tagline"
                                    value={formData.tagline}
                                    onChange={handleChange}
                                    className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <Label htmlFor="email" className="text-sm text-gray-400 mb-2 block">
                                    Email
                                </Label>
                                <Input
                                    name='email'
                                    type="email"
                                    value={formData.email}
                                    disabled
                                    className="bg-slate-700/30 border-slate-600 text-gray-400 placeholder-gray-500 cursor-not-allowed opacity-60"
                                />
                                <p className="text-xs text-gray-500 mt-1">Your email will not be displayed publicly</p>
                            </div>

                            <div>
                                <Label htmlFor="bio" className="text-sm text-gray-400 mb-2 block">
                                    Bio
                                </Label>
                                <Textarea
                                    id="bio"
                                    name='bio'
                                    value={formData.bio}
                                    onChange={handleChange}
                                    className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500 min-h-[120px] resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Social Links */}
                        <div className="bg-slate-800/50 rounded-xl p-6 space-y-6">
                            <h2 className="text-xl font-semibold text-white">Social Links</h2>

                            <div className="space-y-4">
                                <div>
                                    <Label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                                        <Github className="w-4 h-4" />
                                        GitHub
                                    </Label>
                                    <Input
                                        value={formData.github_url}
                                        onChange={handleChange}
                                        name='github_url'
                                        className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <Label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                                        <Twitter className="w-4 h-4" />
                                        Twitter/X
                                    </Label>
                                    <Input
                                        value={formData.twitter_url}
                                        onChange={handleChange}
                                        name='twitter_url'
                                        className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <Label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" />
                                        Discord
                                    </Label>
                                    <Input
                                        value={formData.discord}
                                        onChange={handleChange}
                                        name='discord'
                                        className="bg-slate-700/50 border-slate-600 text-white placeholder-gray-400 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cancel Button */}
                <div className="flex justify-start">
                    <Button
                        variant="ghost"
                        className="text-gray-400 hover:text-white hover:bg-slate-800/50 flex items-center gap-2"
                        onClick={() => navigate('/profile')}
                    >
                        <X className="w-4 h-4" />
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default EditProfile

