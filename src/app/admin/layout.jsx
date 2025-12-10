import AdminNav from '@/components/UI/AdminNav'
import { redirect } from 'next/navigation'
import React from 'react'
import { isAdmin } from '@/middleware/isAdmin'

export const metadata = {
  title: 'Admin',
  description: 'Admin Panel'
}

const AdminLayout = async({ children }) => {
  
  const auth= await isAdmin()

  if(!auth.success){
    redirect('/')
  }

  return (
    <div className='w-full relative'>
      <AdminNav />
      <div className='w-full py-16  p-2 min-h-screen'>
        {children}
      </div>
    </div>
  )
}

export default AdminLayout
