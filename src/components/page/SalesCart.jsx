'use client'
import React, { useContext } from 'react'
import Orderform from '../forms/Orderform'
import { Context } from '../helper/Context'

const SalesCart = () => {
  const { cart, clearCart } = useContext(Context)

  return (
    <div className='w-full flex flex-col gap-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm'>
      <div className='flex items-center justify-between'>
        <h2 className='text-sm font-black text-slate-800 uppercase tracking-widest'>Order Details</h2>
        <button 
          onClick={clearCart} 
          className='text-[9px] font-extrabold text-rose-500 bg-rose-50/50 border border-rose-100/50 px-3 py-1.5 rounded-xl hover:bg-rose-500 hover:text-white transition-all uppercase tracking-wider cursor-pointer'
        >
          Clear Cart
        </button>
      </div>
      
      <Orderform cartItems={cart?.items} />
    </div>
  )
}

export default SalesCart
