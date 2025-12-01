'use client'
import axios from 'axios'
import React, { useEffect, useState } from 'react'

const Profile = () => {
    const [user, setUser]= useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response= await axios.get('/api/profile', {withCredentials: true})
        setUser(response.data.payload)
      } catch (error) {
        console.log(error)
      }
    }
    fetchData()
  }, [])
  console.log(user)

  
  return (
    <div className="w-full min-h-screen flex items-center gap-4 flex-col">

    </div>
  )
}

export default Profile
