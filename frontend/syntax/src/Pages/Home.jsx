import React from 'react'
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate=useNavigate()
  const handleLogout=()=>{
    localStorage.removeItem('emailForOtp');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    navigate('/login')
  }
  return (
    <div>
      <h1>Home page</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}

export default Home
