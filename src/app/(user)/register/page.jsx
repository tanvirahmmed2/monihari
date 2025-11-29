'use client'

import axios from 'axios'
import Link from 'next/link'
import React, { useState } from 'react'

const Register = () => {

  const [data, setData]= useState({
    name: '',
    email: '',
    phone: '',
    password:''

  })

  const handleChange= (e)=>{
    const {name, value}= e.target
    setData((prev)=>({...prev, [name]: value}))
  }

  const handleRegister=async (e) => {
    e.preventDefault()
    try {
      const response= await axios.post('http://localhost:3000/api/user/register', data, {withCredentials: true})
      alert(response.data.message)
    } catch (error) {
      console.log(error)
    }
    
  }
  return (
     <section className='w-full min-h-screen flex items-center justify-center'>

      <div className='w-auto p-6 flex flex-col md:flex-row items-center justify-center gap-4 shadow-2xl rounded-3xl'>
        <div className='w-auto flex flex-col items-center justify-center gap-2 p-2'>
          <p className='text-xl font-semibold'>Welcome to</p>
          <h1 className='text-6xl my-2 font-semibold'>Shop</h1>
          <p className='text-center'>Create your account <br/>enjoy our premium services</p>
          <Link href='/login' className='mx-auto italic text-green-400 text-xs'>Already registered?</Link>
        </div>

        <form onSubmit={handleRegister} className='w-auto flex flex-col justify-center gap-4'>
          <div className='w-full flex flex-col gap-2'>
            <label htmlFor="name">Name</label>
            <input type="text" id='name' name='name' required onChange={handleChange} value={data.name} className='px-2 p-1 border-2 rounded-lg outline-none border-black/15' />
          </div>
          <div className='w-full flex flex-col gap-2'>
            <label htmlFor="phone">Phone</label>
            <input type="text" id='phone' name='phone' required onChange={handleChange} value={data.phone} className='px-2 p-1 border-2 rounded-lg outline-none border-black/15' />
          </div>
          <div className='w-full flex flex-col gap-2'>
            <label htmlFor="email">Email</label>
            <input type="email" id='email' name='email'  required onChange={handleChange} value={data.email} className='px-2 p-1 border-2 rounded-lg outline-none border-black/15' />
          </div>
          <div className='w-full flex flex-col gap-2'>
            <label htmlFor="password">Password</label>
            <input type="password" id='password' name='password' required onChange={handleChange} value={data.password} className='px-2 p-1 border-2 rounded-lg outline-none border-black/15' />
          </div>
          <button type='submit' className='bg-black text-white p-1 rounded-lg cursor-pointer'>Register</button>
        </form>

      </div>

    </section>
  )
}

export default Register
