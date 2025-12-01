'use client'
import axios from 'axios'
import React, { useEffect, useState } from 'react'

const Profile = () => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/profile', { withCredentials: true })
        setUser(response.data.payload)
      } catch (error) {
        console.log(error)
      }
    }
    fetchData()
  }, [])




  return (
    <div className="w-full min-h-screen flex items-center gap-4 flex-col p-2">
      {
        user && <div className='w-full md:w-3/4 flex flex-col items-center gap-4 py-4'>
          <h1 className='text-2xl text-center'>Welcome <span className='font-semibold'>{user.name}</span> !</h1>

        </div>
      }

    </div>
  )
}

export default Profile
