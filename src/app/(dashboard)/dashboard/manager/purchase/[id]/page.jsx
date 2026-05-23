'use client'
import React, { use, useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { printPurchaseInvoice } from '@/lib/database/printPurchaseInvoice'

const PurchaseDetailsPage = ({ params }) => {
    const { id } = use(params)
    const [purchase, setPurchase] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPurchase = async () => {
            try {
                const res = await axios.get(`/api/purchase/${id}`, { withCredentials: true })
                setPurchase(res.data.payload)
            } catch (error) {
                console.error("Error fetching purchase:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchPurchase()
    }, [id])

    if (loading) return <div className="p-10 text-center animate-pulse text-gray-500 font-sans text-sm tracking-widest uppercase">Loading Record...</div>
    if (!purchase) return <div className="p-10 text-center text-red-500 font-bold">Purchase Record Not Found</div>

    return (
        <div className="w-full min-h-screen p-4 bg-gray-50/50 print:bg-white print:p-0">
            <div className="w-full max-w-2xl flex flex-col items-center gap-6 mx-auto bg-white shadow-xl rounded-sm p-6 sm:p-8 border border-gray-100 print:shadow-none print:border-none">
                
                <div className="w-full flex flex-col gap-8">
                    
                    <div className="w-full flex flex-row items-start justify-between">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-2xl font-black tracking-tight text-gray-900 leading-none">NIZAM VARIETIES STORE</h1>
                            <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-medium">Pakuritala Bazar, Tarakanda</p>
                            <p className='text-[11px] text-gray-500 font-medium'>Contact: 01645-172356</p>
                        </div>
                        <div className="flex flex-col text-right gap-1">
                            <h2 className="text-xl font-black text-blue-600 uppercase tracking-tighter">Purchase Record</h2>
                            <p className="text-[11px] text-gray-500"><strong>ID:</strong> PR-{purchase.purchase_id}</p>
                            <p className="text-[11px] text-gray-500"><strong>Invoice:</strong> {purchase.invoice_no || 'N/A'}</p>
                            <p className="text-[11px] text-gray-500"><strong>Date:</strong> {new Date(purchase.created_at || purchase.date).toLocaleDateString('en-GB')}</p>
                        </div>
                    </div>

                    <div className='w-full h-px bg-gray-200'/>

                    <div className="w-full flex flex-row items-start justify-between gap-4">
                        <div className='flex flex-col gap-1'>
                            <h3 className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-1">Supplier Details</h3>
                            <p className="font-bold text-sm text-gray-800 uppercase leading-none">{purchase.supplier_name}</p>
                            <p className="text-xs text-gray-600 font-medium">{purchase.supplier_phone || 'N/A'}</p>
                            <p className="text-xs text-gray-500 whitespace-pre-wrap leading-relaxed max-w-[200px]">{purchase.supplier_address || ''}</p>
                        </div>
                        <div className='flex flex-col gap-1 text-right'>
                            <h3 className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-1">Payment Info</h3>
                            <p className="text-xs text-gray-700">
                                Method: <span className="font-bold text-gray-900 uppercase">{purchase.payment_method || 'Cash'}</span>
                            </p>
                            <p className="text-[10px] font-black text-emerald-600 uppercase italic tracking-wider">Verified Record</p>
                            <p className="text-[11px] text-gray-400 italic max-w-[180px] leading-tight mt-1">{purchase.note || 'No additional instructions'}</p>
                        </div>
                    </div>

                    <div className="w-full flex flex-col text-[13px]">
                        <div className="w-full grid grid-cols-7 gap-2 border-b-2 border-gray-900 pb-2 font-bold text-gray-800 uppercase tracking-tighter">
                            <div className="col-span-1">SL</div>
                            <div className="col-span-3">Product Description</div>
                            <div className="col-span-1 text-right">Price</div>
                            <div className="col-span-1 text-center">Qty</div>
                            <div className="col-span-1 text-right">Amount</div>
                        </div>

                        {purchase.items?.map((item, index) => (
                            <div key={index} className="w-full grid grid-cols-7 gap-2 py-3 border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                <div className="col-span-1 text-gray-400 font-mono text-xs">{String(index + 1).padStart(2, '0')}</div>
                                <div className="col-span-3 font-semibold text-gray-800 uppercase tracking-tight">{item.name}</div>
                                <div className="col-span-1 text-right text-gray-600 font-medium">৳{parseFloat(item.purchase_price).toLocaleString()}</div>
                                <div className="col-span-1 text-center text-gray-600 font-medium">{item.quantity}</div>
                                <div className="col-span-1 text-right font-bold text-gray-900">৳{(parseFloat(item.purchase_price) * item.quantity).toLocaleString()}</div>
                            </div>
                        ))}
                    </div>

                    <div className="w-full sm:w-1/2 ml-auto flex flex-col gap-2 pt-2">
                        <div className="flex justify-between text-gray-500 text-xs font-medium">
                            <span>Subtotal</span>
                            <span className="text-gray-900">৳{parseFloat(purchase.subtotal_amount || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                        </div>
                        
                        {purchase.extra_discount > 0 && (
                            <div className="flex justify-between text-red-500 text-xs font-bold">
                                <span className="uppercase tracking-tighter">Discount</span>
                                <span>-৳{parseFloat(purchase.extra_discount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            </div>
                        )}

                        <div className="flex justify-between items-center border-t border-gray-900 pt-3 mt-1">
                            <span className="font-black text-gray-900 text-sm uppercase tracking-tighter">Net Payable</span>
                            <span className="text-xl font-black text-blue-700 tracking-tighter">
                                ৳{parseFloat(purchase.total_amount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                            </span>
                        </div>
                    </div>

                    <div className="mt-12 text-center border-t border-gray-100 pt-8">
                        <p className="text-[9px] font-bold italic text-gray-300 uppercase tracking-[0.3em]">Computer Generated Document • No Signature Required</p>
                        <p className="mt-2 text-[10px] font-black text-gray-200 tracking-widest uppercase italic">© {new Date().getFullYear()} Razers LTD</p>
                    </div>
                </div>

                <div className="w-full flex flex-row items-center justify-between gap-4 mt-6 print:hidden">
                    <Link href="/dashboard/purchase" 
                        className="flex-1 py-3 text-xs font-bold text-gray-500 bg-gray-50 rounded border border-gray-200 text-center uppercase tracking-widest transition-all hover:bg-gray-100 hover:text-gray-900">
                        ← Back to List
                    </Link>
                    <button 
                        onClick={() => printPurchaseInvoice(purchase)}
                        className="flex-1 py-3 text-xs font-black text-white bg-gray-900 rounded shadow-sm uppercase tracking-[0.2em] transition-all hover:bg-black hover:shadow-lg active:scale-[0.98]"
                    >
                        Print Invoice
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PurchaseDetailsPage