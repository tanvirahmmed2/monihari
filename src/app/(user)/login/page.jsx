import LoginPage from '@/components/pages/LoginPage'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'

const Login = async() => {

  const token = await (await cookies()).get('user_token')?.value

  if(token){
    redirect('/profile')
  }


  return (
    <div>
      <LoginPage/>
    </div>
  )
}

export default Login
