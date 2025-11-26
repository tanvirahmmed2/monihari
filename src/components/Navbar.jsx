import Link from 'next/link'
import React from 'react'

const Navbar = () => {
  return (
    <header className='w-full fixed top-0 '>
        <nav className='w-full h-14 bg-black text-white flex flex-row items-center justify-between px-4'>
            <Link href="/" className='text-2xl font-semibold font-sans'>Manager</Link>
            <div className='flex flex-row items-center justify-center gap-4'>
              <Link href="/users">User</Link>
              <Link href="/events">Events</Link>
              <Link href="/login">Login</Link>
              <Link href="/resgister">Sign Up</Link>
            </div>

        </nav>
    </header>
  )
}

export default Navbar
