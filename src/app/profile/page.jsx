import { cookies } from 'next/headers'
import React from 'react'

const Profile = async() => {

    const token = await (await cookies()).get('user_token')?.value


  return (
    <div>
      <h1>Profile</h1>
    </div>
  )
}

export default Profile
