'use client'
import axios from 'axios'
import Link from 'next/link'
import React, { useState } from 'react'

const Login = () => {
  const [data, setData]= useState({
    email:'',
    password:''
  })

  const handleChange= (e)=>{
    const {name, value}= e.target
    setData((prev)=>({...prev, [name]: value}))

  }

  const handleLogin = async(e)=>{
    e.preventDefault()
    try {
      const response= await axios.post('/api/user/login', data, {withCredentials: true})
      alert(response.data.message)
    } catch (error) {
      console.log(error || "Failed to login")
      
      
    }
  }

  return (
    <section className='w-full min-h-screen flex items-center justify-center'>

      <div className='w-auto p-6 flex flex-col md:flex-row items-center justify-center gap-4 shadow-2xl rounded-3xl'>
        <div className='w-auto flex flex-col items-center justify-center gap-2 p-2'>
          <p className='text-xl font-semibold'>Welcome Back to</p>
          <h1 className='text-3xl my-2 font-semibold'>Monihari</h1>
          <p className='text-center'>Login to your account <br/>enjoy our premium services</p>
          <Link href='/register' className='mx-auto italic text-green-400 text-xs'>register</Link>
        </div>

        <form onSubmit={handleLogin} className='w-auto flex flex-col justify-center gap-4'>
          <div className='w-full flex flex-col gap-2'>
            <label htmlFor="email">Email</label>
            <input type="email" id='email' name='email' required onChange={handleChange} value={data.email} className='px-2 p-1 border-2 rounded-lg outline-none border-black/15' />
          </div>
          <div className='w-full flex flex-col gap-2'>
            <label htmlFor="password">Password</label>
            <input type="password" id='password' name='password' required onChange={handleChange} value={data.password} className='px-2 p-1 border-2 rounded-lg outline-none border-black/15' />
          </div>
          <Link href="/forget-password">Forgot password?</Link>
          <button type='submit' className='bg-black text-white p-1 rounded-lg cursor-pointer'>Login</button>
        </form>

      </div>

    </section>
  )
}

export default Login
