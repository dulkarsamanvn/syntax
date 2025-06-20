import React from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function AdminDashboard() {
  const navigate=useNavigate()
  const handleLogout=async()=>{
    try{
      await axios.post('http://localhost:8000/logout/',{},{withCredentials:true})
    }catch(error){
      console.error('Logout Failed',error)
    }finally{
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('username');
      navigate('/adminlogin')
    }
   
  }
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}

export default AdminDashboard
