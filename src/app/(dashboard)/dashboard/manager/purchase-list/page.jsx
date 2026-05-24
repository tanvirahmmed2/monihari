'use client'
import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { FaBarcode, FaTrash, FaTriangleExclamation, FaCheck, FaXmark, FaPrint } from 'react-icons/fa6'
import { printPurchaseInvoice } from '@/lib/database/printPurchaseInvoice'
import Link from 'next/link'
import { LuView } from 'react-icons/lu'

const PurchaseList = () => {
    const [purchases, setPurchases] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [confirmDelete, setConfirmDelete] = useState(null) // Stores ID of item to delete

    const fetchPurchases = useCallback(async () => {
        try {
            const res = await axios.get(`/api/purchase?q=${searchTerm}`, { withCredentials: true })
            if (res.data.success) setPurchases(res.data.payload || [])
        } catch (error) {
            setPurchases([])
        } finally {
            setLoading(false)
        }
    }, [searchTerm])

    useEffect(() => {
        const handler = setTimeout(() => fetchPurchases(), 300)
        return () => clearTimeout(handler)
    }, [fetchPurchases])

    const handleDelete = async (id) => {
        try {
            const res = await axios.delete('/api/purchase', { data: { id }, withCredentials: true })
            if (res.data.success) {
                toast.success("Purchase deleted and stock reverted")
                setConfirmDelete(null)
                fetchPurchases()
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Delete failed")
        }
    }

    return (
        <div className='w-full min-h-screen flex flex-col items-center p-1 sm:p-4 gap-6 bg-white'>
            <h1 className='text-3xl font-black text-sky-900 uppercase tracking-tighter'>Purchase History</h1>

            <div className='w-full flex flex-row items-center gap-2 px-4 py-1 border border-sky-400 rounded-xl bg-sky-50/30 shadow-sm'>
                <FaBarcode className='text-2xl text-sky-500' />
                <input
                    type="text"
                    placeholder="Search by supplier or invoice..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='w-full px-4 py-3 bg-transparent outline-none text-gray-700 font-medium'
                />
            </div>

            <div className='w-full flex flex-col gap-4'>
                {loading ? (
                    <p className='text-center text-sky-400 animate-pulse font-bold py-20'>FETCHING DATA...</p>
                ) : purchases.map((purchase) => (
                    <div key={purchase.purchase_id} className='w-full grid grid-cols-12 p-5 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow'>


                        <div className='col-span-12 md:col-span-3 border-b md:border-b-0 md:border-r border-gray-100 pb-3 md:pb-0'>
                            <p className='text-[10px] font-black text-sky-500 uppercase tracking-widest'>Source</p>
                            <p className='font-black text-gray-900 text-lg leading-tight'>{purchase.supplier_name}</p>
                            <p className='text-sm text-gray-500 font-medium'>{purchase.supplier_phone}</p>
                            <div className='flex gap-2 mt-2'>
                                <span className='text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded'>INV: {purchase.invoice_no || 'N/A'}</span>
                            </div>
                        </div>
                        <div className='col-span-12 md:col-span-5 p-3'>
                            <p className='text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest'>Manifest</p>
                            <div className='flex flex-col gap-2'>
                                {purchase.items?.length > 0 ? (
                                    purchase.items.map((item, i) => (
                                        <div key={i} className='grid grid-cols-6 text-sm items-center'>
                                            <p className='col-span-3 font-bold text-gray-700 truncate pr-2'>{item.name}</p>
                                            <p className='col-span-1 text-sky-600 font-black'>x{item.quantity}</p>
                                            <p className='col-span-2 text-right font-black text-gray-900'>৳{(item.purchase_price * item.quantity).toLocaleString()}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className='text-xs text-gray-400 italic'>No product data found</p>
                                )}
                            </div>
                        </div>

                        <div className='col-span-12 md:col-span-3 p-3 flex flex-col justify-center bg-gray-50 md:bg-transparent rounded-xl'>
                            <div className='flex justify-between text-xs mb-1'>
                                <span className='text-gray-400 font-bold uppercase'>Gross</span>
                                <span className='font-bold text-gray-600'>৳{purchase.subtotal_amount}</span>
                            </div>
                            <div className='flex justify-between items-center border-t border-gray-200 pt-2'>
                                <span className='text-[10px] font-black text-emerald-600 uppercase'>Total Paid</span>
                                <span className='text-xl font-black text-emerald-600'>৳{Number(purchase.total_amount).toLocaleString()}</span>
                            </div>
                            <p className='text-[9px] text-gray-400 mt-2 font-bold uppercase tracking-tighter'>
                                {new Date(purchase.created_at).toLocaleString()}
                            </p>
                        </div>

                        <div className='col-span-12 md:col-span-1 flex items-center justify-center p-2'>
                            {confirmDelete === purchase.purchase_id ? (
                                <div className='flex flex-col gap-2 w-full animate-in fade-in zoom-in duration-200'>
                                    <button
                                        onClick={() => handleDelete(purchase.purchase_id)}
                                        className='w-full bg-rose-600 text-white p-2 rounded-lg flex items-center justify-center'
                                    >
                                        <FaCheck />
                                    </button>
                                    <button
                                        onClick={() => setConfirmDelete(null)}
                                        className='w-full bg-gray-200 text-gray-600 p-2 rounded-lg flex items-center justify-center'
                                    >
                                        <FaXmark />
                                    </button>
                                </div>
                            ) : (
                                <div className='w-full flex flex-col gap-1 text-center'>
                                    <button
                                        onClick={() => {
                                            if (confirm("Confirm: This will permanently remove stock. Proceed?")) {
                                                setConfirmDelete(purchase.purchase_id)
                                            }
                                        }}
                                        className='w-full bg-gray-200 text-red-600 p-2 rounded-lg flex items-center justify-center '
                                    >
                                        <FaTrash  />
                                    </button>
                                    <button
                                        onClick={() => printPurchaseInvoice(purchase)}
                                        className='w-full bg-gray-200 text-gray-600 p-2 rounded-lg flex items-center justify-center'
                                    >
                                        <FaPrint />
                                    </button>
                                    <Link
                                        href={`/dashboard/manager/purchase/${purchase.purchase_id}`}
                                        className='w-full bg-gray-200 text-gray-600 p-2 rounded-lg flex items-center justify-center'
                                    >
                                        <LuView />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {confirmDelete && (
                <div className='fixed bottom-10 right-10 bg-rose-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce'>
                    <FaTriangleExclamation />
                    <span className='text-sm font-bold uppercase tracking-widest'>Pending Deletion...</span>
                </div>
            )}
        </div>
    )
}

export default PurchaseList
