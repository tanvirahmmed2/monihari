import Link from 'next/link'
import React from 'react'

const Navbar = () => {
  return (
    <header className='w-full fixed top-0 z-40'>
        <nav className='w-full h-14 bg-black text-white flex flex-row items-center justify-between px-4'>
            <Link href="/" className='text-2xl font-semibold font-sans'>Monihari</Link>
            <div className='flex flex-row items-center justify-center gap-4'>
              <div>
                <Link className='' href="/products">Products</Link>
              </div>
              <Link href="/saved">Saved</Link>
              <Link href="/cart">Cart</Link>
              <Link href="/login">Login</Link>
              <Link href="/register">Sign Up</Link>
              <Link href="/admin">Admin</Link>
            </div>

        </nav>
    </header>
  )
}

export default Navbar
