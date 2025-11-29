import React from 'react'

export const metadata={
    title:'Admin',
    description:'Admin Panel'
}

const AdminLayout = ({children, orders}) => {
  return (
    <div className='w-full flex flex-col md:flex-row items-center justify-center p-2'>
      <div className='w-full'>{children}</div>
      <div className='w-full'>{orders}</div>
    </div>
  )
}

export default AdminLayout
