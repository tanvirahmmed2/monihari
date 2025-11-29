import Link from 'next/link'
import React from 'react'

const Login = () => {
  return (
    <section className='w-full min-h-screen flex items-center justify-center'>

      <div className='w-auto p-6 flex flex-col md:flex-row items-center justify-center gap-4 shadow-2xl rounded-3xl'>
        <div className='w-auto flex flex-col items-center justify-center gap-2 p-2'>
          <p className='text-xl font-semibold'>Welcome Back to</p>
          <h1 className='text-6xl my-2 font-semibold'>Shop</h1>
          <p className='text-center'>Login to your account <br/>enjoy our premium services</p>
          <Link href='/register' className='mx-auto italic text-green-400 text-xs'>register</Link>
        </div>

        <form className='w-auto flex flex-col justify-center gap-4'>
          <div className='w-full flex flex-col gap-2'>
            <label htmlFor="email">Email</label>
            <input type="email" id='email' name='email' className='px-2 p-1 border-2 rounded-lg outline-none border-black/15' />
          </div>
          <div className='w-full flex flex-col gap-2'>
            <label htmlFor="password">Password</label>
            <input type="password" id='password' name='password' className='px-2 p-1 border-2 rounded-lg outline-none border-black/15' />
          </div>
          <Link href="/forget-password">Forgot password?</Link>
          <button type='submit' className='bg-black text-white p-1 rounded-lg cursor-pointer'>Login</button>
        </form>

      </div>

    </section>
  )
}

export default Login
