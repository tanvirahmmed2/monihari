'use client'
import React, { useEffect, useState, useCallback, useContext } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { generateReceipt } from '@/lib/database/print'
import { FaPrint, FaCheck, FaXmark } from 'react-icons/fa6'
import { GiConfirmed } from 'react-icons/gi'
import { MdDelete, MdOutlineDoneAll } from 'react-icons/md'
import { MdOutlineCancel } from 'react-icons/md'
import { Context } from '@/components/helper/Context'

const PendingOrdersPage = () => {
  const { siteData } = useContext(Context)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [confirmCancel, setConfirmCancel] = useState(null)
  const [confirmDeliver, setConfirmDeliver] = useState(null)
  const [acceptingOrder, setAcceptingOrder] = useState(null)
  const [receivedAmount, setReceivedAmount] = useState('')
  const [processing, setProcessing] = useState(null)

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const res = await axios.get(`/api/order/status?q=pending`, { withCredentials: true })
      setOrders(res.data.success ? res.data.payload : [])
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const confirmOrder = async (orderId, amount) => {
    try {
      const res = await axios.put('/api/order', { 
        orderId, 
        action: 'confirm', 
        amountReceived: Number(amount || 0) 
      }, { withCredentials: true })
      if (res.data.success) {
        toast.success('Order confirmed & payment updated')
        setAcceptingOrder(null)
        setReceivedAmount('')
        fetchOrders()
        generateReceipt(res.data.payload, siteData)
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Confirmation failed')
    }
  }

  const directDeliverOrder = async (orderId) => {
    if (processing) return
    setProcessing(orderId)
    try {
      const res = await axios.put('/api/order', { orderId, action: 'direct_deliver' }, { withCredentials: true })
      if (res.data.success) {
        toast.success('Order delivered immediately!')
        setConfirmDeliver(null)
        fetchOrders()
        generateReceipt(res.data.payload, siteData)
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Delivery failed')
    } finally {
      setProcessing(null)
    }
  }

  const cancelOrder = async (orderId) => {
    try {
      const res = await axios.put('/api/order', { orderId, action: 'cancel' }, { withCredentials: true })
      if (res.data.success) {
        toast.success('Order cancelled')
        setConfirmCancel(null)
        fetchOrders()
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Cancel failed')
    }
  }

  const deleteOrder = async (orderId) => {
    try {
      const res = await axios.put('/api/order', { orderId, action: 'delete' }, { withCredentials: true })
      if (res.data.success) {
        toast.success('Order deleted')
        setConfirmDelete(null)
        fetchOrders()
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Delete failed')
    }
  }

  return (
    <div className='w-full max-w-7xl mx-auto p-4 md:p-6 flex flex-col gap-6 bg-slate-50 min-h-screen'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100'>
        <div>
          <h1 className='text-2xl font-bold text-slate-800 tracking-tight'>Pending Orders</h1>
          <p className='text-sm text-slate-500 mt-1'>Review and confirm or cancel incoming orders</p>
        </div>
        <div className='bg-amber-50 px-4 py-2 rounded-xl border border-amber-100'>
          <span className='text-amber-700 font-bold'>{orders.length}</span>
          <span className='text-amber-600 text-xs uppercase tracking-wider ml-2 font-bold'>Awaiting Confirmation</span>
        </div>
      </div>

      {/* Orders List */}
      <div className='w-full flex flex-col gap-4'>
        {loading ? (
          <p className='text-center text-sky-400 animate-pulse font-bold py-20'>Fetching Pending Orders...</p>
        ) : orders.length === 0 ? (
          <div className='w-full h-64 flex flex-col items-center justify-center text-center gap-3 p-6 bg-white rounded-2xl shadow-sm border border-slate-100'>
            <p className='text-slate-600 font-semibold'>No Pending Orders</p>
            <p className='text-slate-400 text-sm mt-1'>You're all caught up!</p>
          </div>
        ) : orders.map((order) => (
          <div key={order.order_id} className='w-full grid grid-cols-1 md:grid-cols-12 gap-4 p-5 border border-slate-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow'>

            {/* Customer & Date */}
            <div className='md:col-span-3 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-4 flex flex-col justify-center'>
              <div className='flex items-center gap-2 mb-2'>
                <span className='text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-amber-100 text-amber-700'>
                  Pending
                </span>
                <span className='text-[10px] text-slate-400 font-bold uppercase'>
                  {(order.created_at || order.date)?.slice(0, 10)}
                </span>
              </div>
              <p className='font-bold text-slate-800 text-lg leading-tight'>{order.name || 'Walk-in Customer'}</p>
              <p className='text-sm text-slate-500 font-medium'>{order.phone || 'No Phone'}</p>
              <p className='text-[10px] font-mono text-slate-400 mt-2'>ID: {order.order_id}</p>
              {order.shipping_address && (
                <p className='text-[10px] text-slate-500 mt-2 italic line-clamp-2'>
                  <span className='font-black uppercase text-[8px] text-slate-400 mr-1 not-italic'>Address:</span> 
                  {order.shipping_address}
                </p>
              )}
              {order.note && (
                <p className='text-[10px] text-sky-600 mt-1 italic font-medium line-clamp-2'>
                  <span className='font-black uppercase text-[8px] text-slate-400 mr-1 not-italic'>Note:</span> 
                  {order.note}
                </p>
              )}
            </div>

            {/* Products */}
            <div className='md:col-span-5 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:px-4 flex flex-col justify-center'>
              <p className='text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest'>Order Items</p>
              <div className='flex flex-col gap-2 max-h-32 overflow-y-auto pr-2'>
                {order.product_list?.length > 0 ? order.product_list.map((product, pIdx) => (
                  <div key={pIdx} className='flex justify-between items-start text-sm gap-2'>
                    <div className='flex-1 min-w-0'>
                      <p className='font-bold text-slate-700 truncate'>
                        <span className='text-sky-500 font-black mr-1'>x{product.quantity}</span>
                        {product.name}
                      </p>
                      {product.variant_name && <span className='text-[10px] font-bold uppercase tracking-wide text-slate-400 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5'>{product.variant_name}</span>}
                    </div>
                    <p className='font-black text-slate-900 shrink-0'>৳{(Number(product.price) * Number(product.quantity)).toLocaleString()}</p>
                  </div>
                )) : <p className='text-xs text-slate-400 italic'>No product data</p>}
              </div>
            </div>

            {/* Financials */}
            <div className='md:col-span-2 pb-4 md:pb-0 md:px-4 flex flex-col justify-center gap-1 bg-slate-50 md:bg-transparent rounded-xl p-3 md:p-0'>
              <div className='flex justify-between text-xs text-slate-500 font-medium'>
                <span>Total</span><span>৳{order.total_amount}</span>
              </div>
              <div className='flex justify-between text-xs text-rose-500 font-medium'>
                <span>Discount</span><span>−৳{order.discount || 0}</span>
              </div>
              <div className='flex justify-between text-xs text-blue-500 font-medium'>
                <span>Delivery</span><span>+৳{order.delivery_charge || 0}</span>
              </div>
              <div className='flex justify-between items-center border-t border-slate-200 pt-2 mt-1'>
                <span className='text-[10px] font-black text-emerald-600 uppercase tracking-wider'>Paid</span>
                <span className='text-lg font-black text-emerald-600'>৳{(Number(order.total_amount || 0) - Number(order.due_amount || 0)).toLocaleString()}</span>
              </div>
              {Number(order.due_amount || 0) > 0 && (
                <div className='flex justify-between items-center'>
                  <span className='text-[10px] font-black text-rose-600 uppercase tracking-wider'>Due</span>
                  <span className='text-sm font-black text-rose-600'>৳{Number(order.due_amount).toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className='md:col-span-2 flex md:flex-col items-center justify-center gap-2'>
              {/* Cancel confirm UI */}
              {confirmCancel === order.order_id ? (
                <div className='flex flex-col gap-2 w-full animate-in fade-in zoom-in duration-200'>
                  <p className='text-[10px] text-center text-slate-500 font-bold uppercase tracking-widest'>Cancel order?</p>
                  <button onClick={() => cancelOrder(order.order_id)} className='w-full bg-rose-500 hover:bg-rose-600 text-white p-2.5 rounded-xl flex items-center justify-center gap-1 text-xs font-bold transition-all active:scale-95 shadow-sm'>
                    <FaCheck /> Yes, Cancel
                  </button>
                  <button onClick={() => setConfirmCancel(null)} className='w-full bg-slate-100 hover:bg-slate-200 text-slate-600 p-2.5 rounded-xl flex items-center justify-center transition-all active:scale-95'>
                    <FaXmark />
                  </button>
                </div>
              ) : confirmDeliver === order.order_id ? (
                <div className='flex flex-col gap-2 w-full animate-in fade-in zoom-in duration-200'>
                  <p className='text-[10px] text-center text-slate-500 font-bold uppercase tracking-widest'>Deliver immediately?</p>
                  <button
                    onClick={() => directDeliverOrder(order.order_id)}
                    disabled={processing === order.order_id}
                    className='w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-white p-2.5 rounded-xl flex items-center justify-center gap-1 text-xs font-bold transition-all active:scale-95 shadow-sm'
                  >
                    <FaCheck /> {processing === order.order_id ? 'Processing…' : 'Confirm Delivery'}
                  </button>
                  <button onClick={() => setConfirmDeliver(null)} className='w-full bg-slate-100 hover:bg-slate-200 text-slate-600 p-2.5 rounded-xl flex items-center justify-center transition-all active:scale-95'>
                    <FaXmark />
                  </button>
                </div>
              ) : confirmDelete === order.order_id ? (
                <div className='flex flex-col gap-2 w-full animate-in fade-in zoom-in duration-200'>
                  <p className='text-[10px] text-center text-slate-500 font-bold uppercase tracking-widest'>Delete permanently?</p>
                  <button onClick={() => deleteOrder(order.order_id)} className='w-full bg-rose-500 hover:bg-rose-600 text-white p-2.5 rounded-xl flex items-center justify-center gap-1 text-xs font-bold transition-all active:scale-95 shadow-sm'>
                    <FaCheck /> Delete
                  </button>
                  <button onClick={() => setConfirmDelete(null)} className='w-full bg-slate-100 hover:bg-slate-200 text-slate-600 p-2.5 rounded-xl flex items-center justify-center transition-all active:scale-95'>
                    <FaXmark />
                  </button>
                </div>
              ) : acceptingOrder === order.order_id ? (
                <div className='flex flex-col gap-2 w-full animate-in fade-in zoom-in duration-200'>
                  <p className='text-[10px] text-center text-slate-500 font-bold uppercase tracking-widest'>Received Amount</p>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={receivedAmount} 
                      onChange={(e) => setReceivedAmount(e.target.value)}
                      placeholder={order.total_amount}
                      className="w-full p-2.5 border border-sky-100 rounded-xl text-center font-bold text-slate-700 bg-white shadow-inner focus:ring-2 focus:ring-sky-200 outline-none transition-all"
                      autoFocus
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">৳</span>
                  </div>
                  {Number(receivedAmount) > Number(order.total_amount) && (
                    <p className='text-[10px] text-center text-emerald-600 font-bold'>
                      Change: ৳{(Number(receivedAmount) - Number(order.total_amount)).toLocaleString()}
                    </p>
                  )}
                  <button 
                    onClick={() => confirmOrder(order.order_id, receivedAmount)} 
                    className='w-full bg-sky-500 hover:bg-sky-600 text-white p-2.5 rounded-xl flex items-center justify-center gap-1 text-xs font-bold transition-all active:scale-95 shadow-sm mt-1'
                  >
                    <FaCheck /> Confirm Accept
                  </button>
                  <button onClick={() => { setAcceptingOrder(null); setReceivedAmount(''); }} className='w-full bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-xl flex items-center justify-center transition-all active:scale-95'>
                    <FaXmark />
                  </button>
                </div>
              ) : (
                <div className='w-full flex flex-col gap-2'>
                  <div className='grid grid-cols-1 gap-2'>
                    <button onClick={() => setConfirmDeliver(order.order_id)} className='w-full bg-emerald-500 hover:bg-emerald-600 text-white p-2.5 rounded-xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-tighter transition-all active:scale-95 shadow-sm' title='Deliver Immediately'>
                      <MdOutlineDoneAll size={18} /> Direct Deliver
                    </button>
                    <button onClick={() => { setAcceptingOrder(order.order_id); setReceivedAmount(order.total_amount); }} className='w-full bg-sky-500 hover:bg-sky-600 text-white p-2.5 rounded-xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-tighter transition-all active:scale-95 shadow-sm' title='Accept & Confirm'>
                      <GiConfirmed size={18} /> Accept Order
                    </button>
                  </div>
                  <div className='grid grid-cols-3 gap-2'>
                    <button onClick={() => generateReceipt?.(order, siteData)} className='bg-slate-50 text-slate-600 hover:bg-slate-100 p-2.5 rounded-xl flex items-center justify-center transition-all active:scale-95' title='Print'>
                      <FaPrint size={15} />
                    </button>
                    <button onClick={() => setConfirmCancel(order.order_id)} className='bg-amber-50 text-amber-600 hover:bg-amber-100 p-2.5 rounded-xl flex items-center justify-center transition-all active:scale-95' title='Cancel Order'>
                      <MdOutlineCancel size={18} />
                    </button>
                    <button onClick={() => setConfirmDelete(order.order_id)} className='bg-rose-50 text-rose-500 hover:bg-rose-100 p-2.5 rounded-xl flex items-center justify-center transition-all active:scale-95' title='Delete Order'>
                      <MdDelete size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PendingOrdersPage
