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
      className='w-full fixed top-0 left-0 right-0 z-50 bg-white/75 backdrop-blur-lg border-b border-slate-100 shadow-xs'
    >
      <nav className='max-w-7xl mx-auto flex flex-row items-center justify-between h-16 px-6'>
       
        <Link href={'/'} className='flex items-center gap-2 group transition-transform duration-300 hover:scale-[1.02]'>
          {siteData?.logo ? (
            <img src={siteData.logo} alt={siteData.name} className='h-8 w-auto object-contain' />
          ) : (
            <span className='text-xl font-black tracking-tight bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent uppercase'>
              {siteData?.name || 'Monihari'}
            </span>
          )}
        </Link>
        <div className='hidden md:flex items-center justify-center w-auto gap-2 bg-slate-100/50 p-1 rounded-xl border border-slate-200/30'>
          <NavLink href='/' icon={<HomeIcon size={15} />} label='Home' active={pathname === '/'} />
          <NavLink href='/offers' icon={<Tag size={15} />} label='Offers' active={pathname === '/offers'} />
          <NavLink href='/products' icon={<Package size={15} />} label='Products' active={pathname === '/products'} />
        </div>
        <div className='flex flex-row items-center gap-3'>

          <div className='flex items-center gap-2'>
            <Link
              href={'/search'}
              className='p-2 rounded-xl hover:bg-indigo-50/50 text-slate-600 hover:text-primary transition-all duration-200'
              aria-label="Search"
            >
              <SearchIcon size={18} />
            </Link>

            <Link
              href={'/cart'}
              className='relative p-2 rounded-xl hover:bg-indigo-50/50 text-slate-600 hover:text-primary transition-all duration-200'
              aria-label="Cart"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className='absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm animate-pulse'>
                  {cartCount}
                </span>
              )}
            </Link>

            {isLoggedIn ? (
              <UserMenu userData={userData} handleLogout={handleLogout} />
            ) : (
              <Link
                href={'/login'}
                className='flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700 transition-all shadow-sm active:scale-95 shadow-indigo-600/10 hover:shadow-indigo-600/20'
              >
                <User size={13} />
                <span className='hidden sm:inline'>Sign In</span>
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
    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-bold transition-all text-xs ${active
        ? 'text-indigo-600 bg-white shadow-xs font-extrabold'
        : 'text-slate-500 hover:text-slate-900 hover:bg-white/40'
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
        <div className='w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-black text-sm shadow-md border-2 border-white ring-1 ring-slate-100 group-hover:ring-indigo-500 transition-all'>
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
            className='absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50'
          >
            {/* User info header */}
            <div className='px-4 py-3.5 border-b border-slate-100 bg-slate-50/50'>
              <p className='text-xs font-black text-slate-800 truncate'>{userData?.name}</p>
              <p className='text-[10px] text-slate-400 font-bold truncate'>{userData?.email}</p>
            </div>

            {/* Menu items */}
            <div className='py-1.5'>
              <DropdownLink
                href='/profile'
                icon={<User size={14} className="text-slate-400" />}
                label='My Profile'
                onClick={() => setOpen(false)}
              />
              <DropdownLink
                href='/user/orders'
                icon={<ShoppingBag size={14} className="text-slate-400" />}
                label='My Orders'
                onClick={() => setOpen(false)}
              />
              <DropdownLink
                href='/user/reviews'
                icon={<MdReviews size={14} className="text-slate-400" />}
                label='Reviews'
                onClick={() => setOpen(false)}
              />
              <DropdownLink
                href='/user/settings'
                icon={<Settings size={14} className="text-slate-400" />}
                label='Settings'
                onClick={() => setOpen(false)}
              />
              <DropdownLink
                href='/user'
                icon={<BsDashSquare size={14} className="text-slate-400" />}
                label='Dashboard'
                onClick={() => setOpen(false)}
              />
            </div>

            <div className='border-t border-slate-100 py-1.5'>
              <button
                onClick={() => { setOpen(false); handleLogout(); }}
                className='w-full flex items-center gap-3 px-4 py-2.5 text-xs text-rose-500 font-bold hover:bg-rose-50/50 transition-colors text-left'
              >
                <LogOut size={14} />
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
    className='flex items-center gap-3 px-4 py-2.5 text-xs text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-900 transition-colors'
  >
    {icon}
    {label}
  </Link>
)

export default Navbar
