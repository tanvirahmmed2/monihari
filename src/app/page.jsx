import Featured from '@/components/pages/Featured'
import React from 'react'

const page = () => {
  return (
    <div className='w-full min-h-screen flex flex-col items-center justify-center gap-2'>
      <h1 className='text-xl font-semibold italic'>Welcome to Managers HomePage</h1>
      <Featured/>
    </div>
  )
}

export default page
