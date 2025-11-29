import React from 'react'

const ForgetPassword = () => {
  return (
    <div className='w-full min-h-screen flex items-center justify-center'>
      <div className='w-auto shadow-2xl rounded-2xl flex flex-col items-center justify-center p-4 gap-4'>

        <h1 className='text-lg font-semibold'>Get back to your account</h1>

        <form className='w-auto flex flex-col justify-center gap-4'>

          <div className='w-full flex flex-col gap-2'>
            <label htmlFor="email">Email</label>
            <input type="email" id='email' name='email' className='px-2 p-1 border-2 rounded-lg outline-none border-black/15' />
          </div>


          <button type='submit' className='bg-black text-white p-1 rounded-lg cursor-pointer'>Next</button>
        </form>


      </div>
    </div>
  )
}

export default ForgetPassword
