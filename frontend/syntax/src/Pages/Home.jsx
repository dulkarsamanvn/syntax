import axios from 'axios';
import React from 'react'
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate=useNavigate()
  const handleLogout=async()=>{
    try{
      await axios.post('http://localhost:8000/logout/',{},{withCredentials:true})
    }catch(error){
      console.error('Logout Failed',error)
    }finally{
      localStorage.removeItem('emailForOtp');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('username');
      navigate('/login')
    }
   
  }
  return (
    <div>
      <h1>Home page</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}

export default Home
