import React from 'react'
import axiosInstance from '@/api/axiosInstance'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/Components/ui/button'

function Settings() {
  const navigate = useNavigate()
  const handleLogout = async () => {
    try {
      await axiosInstance.post('/logout/', {})
      navigate('/login')
    } catch (error) {
      console.error('Logout Failed', error)
    } finally {
      localStorage.removeItem('emailForOtp');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('username');
    }
  }
  return (
    <div>
      {/* <button onClick={handleLogout}>Logout</button> */}
      <Button className=" mt-10 ml-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200 shadow-lg hover:shadow-xl"
        onClick={handleLogout}>
        Logout
      </Button>
    </div>
  )
}

export default Settings
