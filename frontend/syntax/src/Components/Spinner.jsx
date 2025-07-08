import React from 'react'

function Spinner() {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-transparent rounded-full animate-spin relative overflow-hidden">
        <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
        <div
          className="absolute inset-0 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"
          style={{ animationDelay: "0.1s" }}
        ></div>
      </div>
    </div>
  )
}

export default Spinner
