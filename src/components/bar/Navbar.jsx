'use client'
import Link from 'next/link'
import React, { useContext } from 'react'
import Image from 'next/image';
import { SearchIcon, ShoppingCart, User, Tag, Package, ShoppingBag, Settings, LogOut, HomeIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Context } from '../helper/Context';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { usePathname } from 'next/navigation';
import { MdReviews } from 'react-icons/md';
import { BsDashSquare } from 'react-icons/bs';

const Navbar = () => {
  const { userData, setUserData, cart, siteData } = useContext(Context)
  const pathname = usePathname()

  const isLoggedIn = userData && userData.user_id
  const cartCount = cart?.items?.reduce((acc, i) => acc + i.quantity, 0) || 0

  const handleLogout = async () => {
    try {
      await axios.get('/api/user/login', { withCredentials: true })
      setUserData(null)
      toast.success('Logged out successfully')
      window.location.replace('/login')
    } catch {
      toast.error('Failed to logout')
    }
  }

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className='w-full fixed top-0 left-0 right-0 z-50'
    >
      <nav className='w-full flex flex-row items-center justify-between h-14 px-4 bg-white border-b-2 border-slate-100 shadow-sm'>
       
        <Link href={'/'} className='flex items-center gap-2 group'>

          <span className='text-2xl font-black tracking-tight text-slate-900 uppercase '>
            Razers
          </span>
        </Link>
        <div className='hidden md:flex items-center justify-center w-auto gap-0.5'>
          <NavLink href='/' icon={<HomeIcon size={16} />} label='Home' active={pathname === '/'} />
          <NavLink href='/offers' icon={<Tag size={16} />} label='Offers' active={pathname === '/offers'} />
          <NavLink href='/products' icon={<Package size={16} />} label='Products' active={pathname === '/products'} />
        </div>
        <div className='flex flex-row items-center gap-1 sm:gap-3'>


          <div className='flex items-center gap-1.5 sm:gap-2'>

            <Link
              href={'/search'}
              className='p-2 rounded-full hover:bg-sky-50 text-slate-600 transition-colors'
              aria-label="Search"
            >
              <SearchIcon size={19} />
            </Link>

            <Link
              href={'/cart'}
              className='relative p-2 rounded-full hover:bg-sky-50 text-slate-600 transition-colors'
              aria-label="Cart"
            >
              <ShoppingCart size={19} />
              {cartCount > 0 && (
                <span className='absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1'>
                  {cartCount}
                </span>
              )}
            </Link>

            {isLoggedIn ? (
              <UserMenu userData={userData} handleLogout={handleLogout} />
            ) : (
              <Link
                href={'/login'}
                className='flex items-center gap-2 px-4 py-1.5 bg-black text-white rounded-full font-semibold text-sm hover:bg-gray-800 transition-all shadow-sm active:scale-95'
              >
                <User size={15} />
                <span className='hidden sm:inline'>Login</span>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </motion.div>
  )
}

// ── Nav Link ─────────────────────────────────────────────────────────────────
const NavLink = ({ href, icon, label, active }) => (
  <Link
    href={href}
    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all text-sm ${active
        ? 'text-black bg-slate-100 font-bold'
        : 'text-slate-600 hover:text-black hover:bg-slate-50'
      }`}
  >
    {icon}
    <span>{label}</span>
  </Link>
)

// ── User Avatar Dropdown ──────────────────────────────────────────────────────
const UserMenu = ({ userData, handleLogout }) => {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef(null)

  // Close on outside click
  React.useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className='relative' ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className='flex items-center gap-2 group focus:outline-none'
        aria-label="User menu"
      >
        <div className='w-9 h-9 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 text-white flex items-center justify-center font-bold text-sm shadow border-2 border-white ring-1 ring-slate-200 group-hover:ring-black transition-all'>
          {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className='absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50'
          >
            {/* User info header */}
            <div className='px-4 py-3 border-b border-slate-100 bg-slate-50/60'>
              <p className='text-sm font-bold text-slate-900 truncate'>{userData?.name}</p>
              <p className='text-xs text-slate-400 truncate'>{userData?.email}</p>
            </div>

            {/* Menu items */}
            <div className='py-1.5'>
              <DropdownLink
                href='/profile'
                icon={<User size={15} />}
                label='My Profile'
                onClick={() => setOpen(false)}
              />
              <DropdownLink
                href='/user/orders'
                icon={<ShoppingBag size={15} />}
                label='My Orders'
                onClick={() => setOpen(false)}
              />
              <DropdownLink
                href='/user/reviews'
                icon={<MdReviews size={15} />}
                label='Reviews'
                onClick={() => setOpen(false)}
              />
              <DropdownLink
                href='/user/settings'
                icon={<Settings size={15} />}
                label='Settings'
                onClick={() => setOpen(false)}
              />
              <DropdownLink
                href='/user'
                icon={<BsDashSquare size={15} />}
                label='Dashboard'
                onClick={() => setOpen(false)}
              />
            </div>

            <div className='border-t border-slate-100 py-1.5'>
              <button
                onClick={() => { setOpen(false); handleLogout(); }}
                className='w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 font-semibold hover:bg-red-50 transition-colors text-left'
              >
                <LogOut size={15} />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const DropdownLink = ({ href, icon, label, onClick }) => (
  <Link
    href={href}
    onClick={onClick}
    className='flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 font-medium hover:bg-slate-50 hover:text-black transition-colors'
  >
    {icon}
    {label}
  </Link>
)

export default Navbar
