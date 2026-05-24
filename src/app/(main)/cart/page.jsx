'use client'
import { Context } from '@/components/helper/Context'
import React, { useContext, useEffect, useState } from 'react'
import { Trash2, Minus, Plus, ShoppingBag, CreditCard, Phone, User, ArrowRight, Loader2, MapPin, Tag } from "lucide-react";
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import ReceiptModal from '@/components/page/ReceiptModal';

const CartPage = () => {
  const { cart, removeFromCart, decreaseQuantity, increaseQuantity, clearCart, userData } = useContext(Context)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [receipt, setReceipt] = useState(null)

  const [formData, setFormData] = useState({
    name: userData?.name || '',
    phone: userData?.phone || '',
    address: '',
    note: '',
    deliveryLocation: 'inside',
    deliveryCharge: 70,
    subTotal: 0,
    discount: 0,
    totalPrice: 0,
    paymentMethod: 'cash',
    transactionId: ''
  })

  // Sync user data into form when it loads
  useEffect(() => {
    if (userData?.name) setFormData(prev => ({ ...prev, name: userData.name }))
    if (userData?.phone) setFormData(prev => ({ ...prev, phone: userData.phone }))
  }, [userData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Recalculate totals whenever cart or delivery location changes
  useEffect(() => {
    if (!cart?.items) return;

    const subTotal = cart.items.reduce((sum, item) =>
      sum + (parseFloat(item.sale_price || 0) * (item.quantity || 0)), 0)

    const totalDiscount = cart.items.reduce((sum, item) =>
      sum + (parseFloat(item.discount_price || 0) * (item.quantity || 0)), 0)

    const deliveryCharge = formData.deliveryLocation === 'inside' ? 70 : 120
    const totalPrice = subTotal - totalDiscount + deliveryCharge

    setFormData(prev => ({ ...prev, subTotal, discount: totalDiscount, deliveryCharge, totalPrice }))
  }, [cart?.items, formData.deliveryLocation])

  const placeOrder = async (e) => {
    e.preventDefault()
    if (cart.items.length === 0) return toast.error("Your cart is empty");

    setIsSubmitting(true)

    const payload = {
      customerName: formData.name,
      phone: formData.phone,
      address: formData.address,
      note: formData.note,
      deliveryCharge: formData.deliveryCharge,
      subtotal: formData.subTotal,
      discount: formData.discount,
      total: formData.totalPrice,
      paymentMethod: formData.paymentMethod,
      transactionId: formData.transactionId,
      status: 'pending',
      // Include variant_id and snapshot fields for receipt
      items: cart.items.map(item => ({
        product_id: item.product_id,
        variant_id: item.variant_id || null,
        variant_name: item.variant_name || null,
        name: item.name,
        image: item.image,
        quantity: item.quantity,
        price: parseFloat(item.sale_price) - parseFloat(item.discount_price || 0)
      }))
    }

    try {
      const response = await axios.post('/api/order/public', payload, { withCredentials: true })
      toast.success(response.data.message || 'Order placed successfully!');

      // Build receipt from server response + local payload
      const serverReceipt = response.data.receiptData || {}
      setReceipt({
        ...serverReceipt,
        customerName: formData.name,
        phone: formData.phone,
        address: formData.address,
        note: formData.note,
        items: payload.items,
        subtotal: formData.subTotal,
        discount: formData.discount,
        deliveryCharge: formData.deliveryCharge,
        total: formData.totalPrice,
        paymentMethod: formData.paymentMethod,
        transactionId: formData.transactionId || null,
        status: 'pending',
      })

      clearCart()

    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to place order')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseReceipt = () => {
    setReceipt(null)
    setFormData({
      name: '', phone: '', address: '', note: '',
      deliveryLocation: 'inside', deliveryCharge: 70,
      subTotal: 0, discount: 0, totalPrice: 0,
      paymentMethod: 'cash', transactionId: ''
    })
  }

  // Empty cart state
  if (!cart || cart?.items.length < 1) return (
    <>
      {/* Show receipt modal even after cart is cleared */}
      {receipt && <ReceiptModal receipt={receipt} onClose={handleCloseReceipt} />}

      <div className='w-full min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4'>
        <div className='w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-300'>
          <ShoppingBag size={40} />
        </div>
        <div className='text-center'>
          <h2 className='text-xl font-black text-slate-800'>Your cart is empty</h2>
          <p className='text-slate-500 text-sm font-medium mt-1'>Looks like you haven't added anything yet.</p>
        </div>
        <Link href="/products" className='group flex items-center gap-2.5 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-dark transition-all shadow-sm active:scale-95'>
          Start Shopping
          <ArrowRight size={18} className='group-hover:translate-x-1 transition-transform' />
        </Link>
      </div>
    </>
  )

  return (
    <>
      {receipt && <ReceiptModal receipt={receipt} onClose={handleCloseReceipt} />}

      <div className='w-full max-w-7xl mx-auto px-4 py-16'>

        <div className='w-full flex flex-col items-center gap-5'>
          <div className='w-full flex flex-row items-center justify-between'>
            <p className='border-b-2 border-sky-500 font-bold text-slate-800 pr-4 pb-1'>Checkout</p>
            <button
              onClick={clearCart}
              className='flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-500 transition-colors uppercase tracking-widest'
            >
              <Trash2 size={14} />
              Clear Cart
            </button>
          </div>

          <form onSubmit={placeOrder} className='w-full flex flex-col lg:flex-row gap-8 lg:gap-10'>

            {/* Left: Customer Details */}
            <div className='w-full flex flex-col lg:w-3/5 gap-4'>
              <p className='text-[10px] font-black uppercase tracking-widest text-slate-400'>Your Details</p>

              <div className='relative'>
                <User className='absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400' size={18} />
                <input
                  type="text" name='name' required placeholder="Full Name"
                  onChange={handleChange} value={formData.name}
                  className='w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-sky-500 transition-colors'
                />
              </div>

              <div className='relative w-full'>
                <Phone className='absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400' size={18} />
                <input
                  type="text" name='phone' required placeholder="Phone Number"
                  onChange={handleChange} value={formData.phone}
                  className='w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-sky-500 transition-colors'
                />
              </div>

              <div className='relative w-full'>
                <MapPin className='absolute left-3.5 top-3.5 text-slate-400' size={18} />
                <textarea
                  name='address' required placeholder="Delivery Address"
                  onChange={handleChange} value={formData.address}
                  rows={3}
                  className='w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-sky-500 transition-colors resize-none'
                />
              </div>

              <div className='relative w-full'>
                <Tag className='absolute left-3.5 top-3.5 text-slate-400' size={18} />
                <textarea
                  name='note' placeholder="Special Note (Optional)"
                  onChange={handleChange} value={formData.note}
                  rows={3}
                  className='w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl outline-none focus:border-sky-500 transition-colors resize-none'
                />
              </div>
            </div>

            {/* Right: Cart Items + Summary */}
            <div className='w-full flex flex-col gap-6'>

              {/* Cart Items */}
              <div className='flex flex-col gap-3'>
                <p className='text-[10px] font-black uppercase tracking-widest text-slate-400'>
                  Items ({cart.items.length})
                </p>
                <AnimatePresence mode='popLayout'>
                  {cart.items.map((item) => {
                    const itemTotal = (parseFloat(item.sale_price) - parseFloat(item.discount_price || 0)) * item.quantity
                    return (
                      <motion.div
                        key={item?.cartItemId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className='group bg-white rounded-2xl border border-slate-100 p-3 md:p-4 flex flex-col md:flex-row items-center gap-4 hover:shadow-md transition-all duration-300'
                      >
                        {/* Thumbnail */}
                        <div className='w-20 h-20 rounded-xl bg-slate-50 shrink-0 overflow-hidden border border-slate-100 flex items-center justify-center'>
                          {item?.image ? (
                            <Image src={item?.image} alt={item?.name} width={100} height={100} className='w-full h-full object-cover group-hover:scale-105 transition-transform' />
                          ) : (
                            <ShoppingBag size={24} className='text-slate-200' />
                          )}
                        </div>

                        {/* Info */}
                        <div className='flex-1 text-center md:text-left w-full'>
                          <h3 className='text-base font-bold text-slate-800 line-clamp-1'>{item?.name}</h3>

                          {/* Variant badge */}
                          {item?.variant_name && (
                            <span className='inline-block mt-1 px-2.5 py-0.5 bg-violet-100 text-violet-600 text-[10px] font-bold rounded-md uppercase tracking-wide'>
                              {item.variant_name}
                            </span>
                          )}

                          <div className='flex items-center justify-center md:justify-start gap-2 mt-1.5'>
                            <p className='text-xs font-bold text-slate-600'>
                              ৳{(parseFloat(item?.sale_price) - parseFloat(item?.discount_price || 0)).toFixed(2)}
                            </p>
                            {parseFloat(item?.discount_price) > 0 && (
                              <p className='text-[10px] font-medium text-slate-400 line-through'>
                                ৳{parseFloat(item?.sale_price).toFixed(2)}
                              </p>
                            )}
                            <span className='text-[10px] text-slate-400 font-medium'>/ unit</span>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className='flex flex-wrap items-center justify-center md:justify-end gap-4 w-full md:w-auto'>
                          <div className='flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-100'>
                            <button
                              type="button"
                              onClick={() => decreaseQuantity(item?.cartItemId)}
                              className='w-7 h-7 rounded-lg bg-white flex items-center justify-center text-slate-600 hover:text-rose-500 hover:bg-rose-50 transition-all active:scale-90 shadow-sm'
                            >
                              <Minus size={14} />
                            </button>
                            <span className='font-bold text-slate-800 min-w-4 text-center text-sm'>{item?.quantity}</span>
                            <button
                              type="button"
                              onClick={() => increaseQuantity(item?.cartItemId)}
                              className='w-7 h-7 rounded-lg bg-white flex items-center justify-center text-slate-600 hover:text-primary hover:bg-primary/10 transition-all active:scale-90 shadow-sm'
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <div className='text-right min-w-18'>
                            <p className='text-base font-black text-slate-900 tracking-tight'>
                              ৳{itemTotal.toFixed(2)}
                            </p>
                            {parseFloat(item.discount_price) > 0 && (
                              <p className='text-[10px] font-bold text-slate-400 line-through decoration-rose-400/50'>
                                ৳{(parseFloat(item.sale_price) * item.quantity).toFixed(2)}
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item?.cartItemId)}
                            className='p-2.5 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all active:scale-90'
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>

              {/* Order Summary */}
              <div className='w-full bg-white p-5 rounded-2xl border border-slate-100 shadow-sm'>
                <div className='space-y-4'>

                  {/* Delivery Area */}
                  <div className='flex flex-col gap-2'>
                    <label className='text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1'>Delivery Area</label>
                    <div className='grid grid-cols-2 gap-3'>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, deliveryLocation: 'inside' }))}
                        className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${formData.deliveryLocation === 'inside' ? 'bg-primary border-primary text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                      >
                        Inside Dhaka <span className='block text-[10px] font-medium opacity-70'>৳70</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, deliveryLocation: 'outside' }))}
                        className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${formData.deliveryLocation === 'outside' ? 'bg-primary border-primary text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                      >
                        Outside Dhaka <span className='block text-[10px] font-medium opacity-70'>৳120</span>
                      </button>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className='flex flex-col gap-2 pt-1'>
                    <label className='text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1'>Payment Method</label>
                    <div className='flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700'>
                      <CreditCard size={18} className='text-primary' />
                      <span className='font-bold uppercase tracking-wider text-xs'>{formData.paymentMethod} on Delivery</span>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className='flex flex-col gap-3 border-t border-slate-100 pt-5 mt-5'>
                  <div className='flex justify-between text-slate-500 font-medium text-sm'>
                    <span>Subtotal</span>
                    <span>৳{formData.subTotal.toFixed(2)}</span>
                  </div>
                  {formData.discount > 0 && (
                    <div className='flex justify-between text-green-500 font-bold text-sm'>
                      <span>Discount</span>
                      <span>-৳{formData.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className='flex justify-between text-slate-500 font-medium text-sm'>
                    <span>Delivery Charge</span>
                    <span>৳{formData.deliveryCharge.toFixed(2)}</span>
                  </div>
                  <div className='flex justify-between text-xl font-black mt-2 pt-2 border-t border-slate-100'>
                    <span className='text-slate-800'>Total</span>
                    <span className='text-primary'>৳{formData.totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='group mt-6 flex items-center justify-center gap-2.5 w-full py-4 bg-primary text-white rounded-xl font-bold text-base hover:bg-slate-900 transition-all active:scale-[0.98] disabled:opacity-70 shadow-md'
                >
                  {isSubmitting ? (
                    <Loader2 size={20} className='animate-spin' />
                  ) : (
                    <>
                      Confirm Order
                      <ArrowRight size={18} className='group-hover:translate-x-1 transition-transform' />
                    </>
                  )}
                </button>

                <p className='text-[10px] text-center text-slate-400 font-medium leading-relaxed italic mt-4'>
                  * We will contact you shortly to verify your order details and delivery address.
                </p>
              </div>
            </div>

          </form>
        </div>
      </div>
    </>
  )
}

export default CartPage