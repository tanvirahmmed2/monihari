'use client'
import React, { useContext } from 'react'
import { Home, Tag, Package, User, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Context } from '../helper/Context';
import { motion } from 'framer-motion';

const BottomBar = () => {
  const { cart } = useContext(Context)

  return (
    <div className='w-full fixed bottom-0 left-0 right-0 z-50 sm:hidden'>
      <div className='bg-slate-900/90 backdrop-blur-xl border border-slate-800 mx-4 mb-4 rounded-2xl flex flex-row items-center justify-between h-16 px-6 shadow-2xl'>
        <BottomNavItem href='/' icon={<Home size={20} />} label='Home' />
        <BottomNavItem href='/offers' icon={<Tag size={20} />} label='Offers' />
        <BottomNavItem href='/products' icon={<Package size={20} />} label='Products' />
        
        <Link href='/cart' className='relative flex flex-col items-center justify-center text-slate-400 hover:text-indigo-400 transition-colors'>
          {cart?.items?.length > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className='absolute -top-2 -right-2 w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center shadow-lg shadow-indigo-600/30'
            >
              {cart.items.length}
            </motion.span>
          )}
          <ShoppingCart size={20} />
          <span className='text-[9px] mt-1 font-black uppercase tracking-wider'>Cart</span>
        </Link>
      </div>
    </div>
  )
}

const BottomNavItem = ({ href, icon, label }) => (
  <Link href={href} className='flex flex-col items-center justify-center text-slate-400 hover:text-indigo-400 transition-colors'>
    {icon}
    <span className='text-[9px] mt-1 font-black uppercase tracking-wider'>{label}</span>
  </Link>
)

export default BottomBar
