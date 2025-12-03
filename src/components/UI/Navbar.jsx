import { cookies } from 'next/headers'
import Link from 'next/link'
import React from 'react'
import Logout from '../Button/Logout'

const Navbar = async () => {

  const token = await (await cookies()).get('user_token')?.value



  return (
    <header className='w-full fixed top-0 z-40'>
      <nav className='w-full h-14 bg-emerald-500 text-white flex flex-row items-center justify-between px-4'>
        <Link href="/" className='text-2xl font-semibold font-sans'>Monihari</Link>
        <div className='flex flex-row items-center justify-center gap-4'>
          <div className='group w-auto h-14 flex items-center justify-center'>
            <Link className='' href="/products">Products</Link>
            <div className='hidden group-hover:flex flex-col absolute top-14 rounded-lg '>
              <Link className='hover:scale-105 w-full p-2 bg-emerald-50 hover:bg-white text-black' href="/products/category/rice&grains">Rice & Grains</Link>
              <Link className='hover:scale-105 w-full p-2 bg-emerald-50 hover:bg-white text-black' href="/products/category/frozenfood">Frozen Food</Link>
              <Link className='hover:scale-105 w-full p-2 bg-emerald-50 hover:bg-white text-black' href="/products/category/oil&ghee">Oil & Ghee</Link>
              <Link className='hover:scale-105 w-full p-2 bg-emerald-50 hover:bg-white text-black' href="/products/category/masala">Masala</Link>
              <Link className='hover:scale-105 w-full p-2 bg-emerald-50 hover:bg-white text-black' href="/products/category/snacks">Snacks</Link>
              <Link className='hover:scale-105 w-full p-2 bg-emerald-50 hover:bg-white text-black' href="/products/category/healthcare">Health Care</Link>
              <Link className='hover:scale-105 w-full p-2 bg-emerald-50 hover:bg-white text-black' href="/products/category/cleaning&household">Cleaning and Household</Link>
            </div>
          </div>
          <Link href="/saved">Saved</Link>
          <Link href="/cart">Cart</Link>
          <Link href="/contact">Contact</Link>
          {
            token ? <div className='flex flex-row items-center justify-center gap-4'>
              <Link href={'/profile'}>Profile</Link>
              <Logout />
            </div> : <div className='flex flex-row items-center justify-center gap-4'>
              <Link href="/login">Login</Link>
              <Link href="/register">Sign Up</Link>
            </div>
          }
          <Link href="/admin">Admin</Link>
        </div>

      </nav>
    </header>
  )
}

export default Navbar
