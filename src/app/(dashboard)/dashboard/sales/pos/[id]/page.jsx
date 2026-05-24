'use client'
import { generateReceipt } from '@/lib/database/print'
import axios from 'axios'
import Link from 'next/link'
import React, { use, useEffect, useState, useContext } from 'react'
import { Context } from '@/components/helper/Context'

const POSSLIPPAGE = ({ params }) => {
    const { siteData } = useContext(Context)
    const { id } = use(params)
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await axios.get(`/api/order/${id}`, { withCredentials: true })
                setOrder(res.data.payload)
            } catch (error) {
                console.error(error)
                setOrder(null)
            } finally {
                setLoading(false)
            }
        }
        fetchOrder()
    }, [id])

    if (loading) return (
        <div className="fixed inset-0 flex items-center justify-center bg-stone-50">
            <p className="text-xs uppercase tracking-widest text-gray-400 animate-pulse">Loading slip…</p>
        </div>
    )

    if (!order) return (
        <div className="fixed inset-0 flex items-center justify-center bg-stone-50">
            <div className="text-center">
                <p className="text-xs uppercase tracking-widest text-red-400">Slip not found</p>
                <Link href="/dashboard/pos" className="mt-4 inline-block text-[10px] underline">Back to POS</Link>
            </div>
        </div>
    )

    const orderDate = new Date(order.created_at)
    const formattedDate = orderDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    const formattedTime = orderDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

    return (
        <div className="min-h-screen w-full  flex flex-col items-center py-6 sm:py-12 px-4 print:p-0 print:bg-white overflow-x-hidden">
            
            
            <div className="w-full max-w-150 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-5 sm:p-7 border border-gray-100 flex flex-col gap-4 print:shadow-none print:border-none print:w-full">
                
                
                <header className="text-center space-y-1">
                    <h1 className="text-xl font-bold text-gray-900 leading-tight warp-break-word">{siteData.name}</h1>
                    <p className="text-[10px] text-gray-500">{siteData.address}</p>
                    <p className="text-[11px] font-mono">{siteData.phone}</p>
                    <div className="py-2">
                        <div className="h-px w-full border-t border-dashed border-gray-300" />
                        <span className="text-[8px] font-bold uppercase tracking-[4px] text-gray-400 bg-white px-2 -mt-2 relative">Receipt</span>
                    </div>
                </header>


                <div className="space-y-1 text-[11px] font-mono text-gray-600">
                    <div className="flex justify-between uppercase">
                        <span>Invoice</span>
                        <span className="font-bold text-black">#{order.order_id}</span>
                    </div>
                    <div className="flex justify-between uppercase">
                        <span>Date</span>
                        <span>{formattedDate}</span>
                    </div>
                    <div className="flex justify-between uppercase">
                        <span>Time</span>
                        <span>{formattedTime}</span>
                    </div>
                </div>


                <div className="border-y border-dashed border-gray-200 py-3 my-1">
                    <div className="flex justify-between items-center gap-2">
                        <span className="text-xs font-bold text-gray-900 truncate uppercase tracking-tight">
                            {order.customer_name || 'Walk-in Customer'}
                        </span>
                        <span className="shrink-0 text-[9px] border border-black px-1.5 font-bold uppercase">
                            {order.payment_method || 'Cash'}
                        </span>
                    </div>
                    {order.shipping_address && (
                        <p className="text-[10px] text-gray-600 mt-2 italic break-words">
                            <span className="font-bold uppercase text-[8px] mr-1 not-italic">Address:</span>
                            {order.shipping_address}
                        </p>
                    )}
                    {order.note && (
                        <p className="text-[10px] text-gray-600 mt-1 italic break-words">
                            <span className="font-bold uppercase text-[8px] mr-1 not-italic">Note:</span>
                            {order.note}
                        </p>
                    )}
                </div>


                <div className="w-full">
                    <div className="grid grid-cols-12 gap-1 text-[11px] font-black uppercase text-gray-400 border-b pb-1 mb-2">
                        <span className="col-span-7">Description</span>
                        <span className="col-span-2 text-center">Qty</span>
                        <span className="col-span-3 text-right">Total</span>
                    </div>

                    <div className="space-y-3 min-w-0">
                        {order.items?.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-1 min-w-0">
                                <div className="col-span-7 min-w-0">
                                    <p className="text-[14px] font-bold text-gray-900 leading-none truncate block">{item.name}</p>
                                    {item.variant_name && <span className="inline-block text-[9px] font-bold uppercase tracking-wide text-slate-500 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 mt-0.5">{item.variant_name}</span>}
                                    <p className="text-[13px] text-gray-400 font-mono mt-1">@ {Number(item.price).toFixed(2)}</p>
                                </div>
                                <span className="col-span-2 text-[13px] text-center pt-0.5 font-mono text-gray-600">x{item.quantity}</span>
                                <span className="col-span-3 text-[14px] text-right pt-0.5 font-bold font-mono text-gray-900">
                                    {(item.price * item.quantity).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-4 border-t-2 border-black pt-3 space-y-2">
                    <div className="flex justify-between text-xs text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-mono">৳{Number(order.subtotal_amount).toFixed(2)}</span>
                    </div>
                    
                    {order.total_discount_amount > 0 && (
                        <div className="flex justify-between text-xs text-red-600 italic">
                            <span>Discount</span>
                            <span className="font-mono">- ৳{Number(order.total_discount_amount).toFixed(2)}</span>
                        </div>
                    )}

                    {order.delivery_charge > 0 && (
                        <div className="flex justify-between text-xs text-gray-600">
                            <span>Delivery Charge</span>
                            <span className="font-mono">৳{Number(order.delivery_charge).toFixed(2)}</span>
                        </div>
                    )}

                    <div className="flex justify-between items-end pt-1">
                        <span className="text-xs font-black uppercase">Net Total</span>
                        <span className="text-2xl font-bold font-mono tracking-tighter">
                            ৳{Number(order.total_amount).toFixed(2)}
                        </span>
                    </div>
                </div>

                <div className="border-t border-dashed border-gray-300 pt-3 space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-500 uppercase">
                        <span>Paid</span>
                        <span className="font-mono">৳{Number(order.paid_amount || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold uppercase">
                        <span>Change</span>
                        <span className="font-mono">৳{Number(order.change_amount || 0).toFixed(2)}</span>
                    </div>
                    {Number(order.due_amount) > 0 && (
                        <div className="flex justify-between text-[12px] font-black uppercase text-rose-600 mt-1 pt-1 border-t border-dashed border-rose-200">
                            <span>Due Balance</span>
                            <span className="font-mono">৳{Number(order.due_amount).toFixed(2)}</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <footer className="mt-6 text-center">
                    <p className="text-[12px] italic font-medium">Thank you! Come again.</p>
                    <p className="mt-6 text-[8px] uppercase tracking-widest text-gray-400">
                        © {new Date().getFullYear()} {siteData.name}
                    </p>
                </footer>

                <div className="mt-6 flex flex-col gap-2 print:hidden">
                    <button 
                        onClick={() => generateReceipt(order, siteData)} 
                        className="w-full bg-black text-white cursor-pointer py-3 text-[10px] font-bold uppercase tracking-widest rounded active:bg-gray-800 transition-colors shadow-lg"
                    >
                        Print Receipt
                    </button>
                    <Link 
                        href="/dashboard/sales/pos" 
                        className="w-full text-center py-3 text-[10px] font-bold uppercase tracking-widest border border-gray-200 rounded text-gray-500 hover:bg-gray-50"
                    >
                        Return to POS
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default POSSLIPPAGE