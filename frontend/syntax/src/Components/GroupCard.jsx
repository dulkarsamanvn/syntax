import axiosInstance from '@/api/axiosInstance'
import { ArrowRight, MessageSquare } from 'lucide-react'
import React from 'react'
import {toast} from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

function GroupCard({group,joined}) {
    const navigate=useNavigate()

    const handleJoin=async()=>{
        if(joined){
            navigate(`/chat/group/${group.chatroom_id}`)
        }else{
            axiosInstance.post(`/chat/${group.id}/join/`)
            .then(()=>{
                toast.success('You Joined the Group')
                window.location.reload()
            }).catch((err)=>{
                console.error('unable to join the group',err)
                toast.error(err.response?.data?.detail || 'unable to join the group')
            })
        }
    }
    return (
        <div className="group bg-gradient-to-br from-slate-800/90 to-slate-700/80 rounded-xl p-6 border border-slate-600/30 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-lg group-hover:text-blue-300 transition-colors duration-200">
                    {group.name}
                </h4>
                <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-lg animate-pulse"></div>
            </div>

            <p className="text-base text-slate-400 mb-4 line-clamp-2">
                {group.description || "No description provided."}
            </p>

            <p className="text-sm text-slate-500 mb-6">
                Members: <span className="font-semibold text-white">{group.member_count || 0}</span>
            </p>

            <button
                onClick={handleJoin}
                className={`group/btn w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 transition-all duration-300 transform hover:scale-105 shadow-lg ${
          joined
            ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500"
            : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
        }`}
            >
                <MessageSquare className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-200" />
                <span>{joined ? 'Open Chat':'Join Chat'}</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
            </button>
        </div>
    )
}

export default GroupCard
