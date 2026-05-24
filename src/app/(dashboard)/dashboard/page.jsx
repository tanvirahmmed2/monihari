'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import {
    TrendingUp, Users, Package, ShoppingCart,
    ArrowUpRight, ArrowDownRight, Calendar,
    Search, RefreshCcw, DollarSign, Wallet,
    BarChart3, Box
} from 'lucide-react'

import { Context } from '@/components/helper/Context'
import { useContext } from 'react'

const Dashboard = () => {
    const { userData } = useContext(Context)
    const role = userData?.role || 'user'
    
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('Today')
    const [startDate, setStartDate] = useState(new Date())
    const [endDate, setEndDate] = useState(new Date())

    const fetchStats = async () => {
        setLoading(true)
        try {
            const s = format(startDate, 'yyyy-MM-dd')
            const e = format(endDate, 'yyyy-MM-dd')
            const res = await axios.get(`/api/report/dashboard?type=${activeTab}&start=${s}&end=${e}`, { withCredentials: true })
            if (res.data.success) setData(res.data)
        } catch (err) {
            console.error("Fetch Error:", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchStats() }, [activeTab, startDate, endDate])

    if (loading && !data) return (
        <div className='w-full min-h-[60vh] flex items-center justify-center'>
            <div className='flex flex-col items-center gap-3'>
                <RefreshCcw className='animate-spin text-indigo-600' size={32} />
                <p className='text-slate-400 font-extrabold uppercase tracking-widest text-[9px]'>Gathering Intelligence...</p>
            </div>
        </div>
    )

    const { overview, activeRange } = data || {}

    return (
        <div className='flex flex-col gap-8 px-2 lg:px-4 py-4'>

            {/* Header Area */}
            <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
                <div>
                    <h1 className='text-2xl md:text-3xl font-black text-slate-950 tracking-tight'>
                        Store <span className='bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent'>Dashboard</span>
                    </h1>
                    <p className='text-slate-400 text-xs font-bold'>Welcome back, {userData?.name || 'User'}</p>
                </div>

                <div className='flex bg-white p-1 rounded-xl shadow-xs border border-slate-100 overflow-x-auto max-w-full'>
                    {['Today', 'Yesterday', 'This Week', 'This Month', 'This Year', 'Custom'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${activeTab === tab
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Active Range Stats */}
            <div className='bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8'>
                <div className='flex items-center gap-2.5 mb-8'>
                    <BarChart3 size={18} className='text-indigo-600' />
                    <h2 className='text-base font-black text-slate-800 tracking-tight'>Performance Metrics</h2>
                    <div className='h-1 w-8 bg-indigo-100 rounded-full'></div>
                </div>

                {activeTab === 'Custom' && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='mb-8 flex flex-wrap gap-4 items-center bg-indigo-50/30 p-5 rounded-2xl border border-indigo-50 w-fit'
                    >
                        <div className='flex items-center gap-3'>
                            <div className='flex flex-col gap-1'>
                                <label className='text-[9px] font-black text-indigo-600 uppercase tracking-widest ml-1'>Start Date</label>
                                <DatePicker selected={startDate} onChange={d => setStartDate(d)} className='bg-white px-3.5 py-2 rounded-xl font-bold text-slate-700 outline-none border border-slate-200/50 shadow-xs text-xs' />
                            </div>
                            <div className='text-indigo-300 mt-4'>
                                <ArrowUpRight size={16} />
                            </div>
                            <div className='flex flex-col gap-1'>
                                <label className='text-[9px] font-black text-indigo-600 uppercase tracking-widest ml-1'>End Date</label>
                                <DatePicker selected={endDate} onChange={d => setEndDate(d)} className='bg-white px-3.5 py-2 rounded-xl font-bold text-slate-700 outline-none border border-slate-200/50 shadow-xs text-xs' />
                            </div>
                        </div>
                    </motion.div>
                )}

                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
                    <PeriodStat label={`${activeTab} Sales`} value={activeRange?.sales} icon={<TrendingUp size={16} />} trend="+12%" />
                    <PeriodStat label={`${activeTab} Purchases`} value={activeRange?.purchases} icon={<ShoppingCart size={16} />} />
                    <PeriodStat label={`${activeTab} Returns`} value={activeRange?.returns} color="text-rose-600" icon={<RefreshCcw size={16} />} />
                    {(role === 'admin' || role === 'manager') && (
                        <PeriodStat label={`${activeTab} Net Profit`} value={activeRange?.profit} color="text-emerald-600" icon={<DollarSign size={16} />} trend="+8%" />
                    )}
                </div>
            </div>

            {/* Overview Grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5'>
                <StatCard title="Confirmed Orders" value={overview?.total_confirmed_orders} icon={<ShoppingCart size={18} />} />
                <StatCard title="Products" value={overview?.total_products} icon={<Package size={18} />} />
                <StatCard title="Total Sales" value={`৳${Number(overview?.total_sales_amount).toLocaleString()}`} icon={<BarChart3 size={18} />} />
                
                {(role === 'admin' || role === 'manager') && (
                    <>
                        <StatCard title="Net Profit" value={`৳${Number(overview?.total_profit_amount).toLocaleString()}`} icon={<TrendingUp size={18} />} />
                        <StatCard title="Stock Value" value={`৳${Number(overview?.total_stock_value).toLocaleString()}`} icon={<Wallet size={18} />} />
                        <StatCard title="Total Cost" value={`৳${Number(overview?.total_purchase_amount).toLocaleString()}`} icon={<ShoppingCart size={18} />} />
                        <StatCard title="Customers" value={overview?.total_customers} icon={<Users size={18} />} />
                    </>
                )}
                
                <StatCard title="Stock Qty" value={overview?.total_stock_qty} icon={<Box size={18} />} />
                <StatCard title="Total Returns" value={`৳${Number(overview?.total_returned_amount).toLocaleString()}`} icon={<RefreshCcw size={18} />} />
            </div>

        </div>
    )
}

const StatCard = ({ title, value, icon }) => (
    <div className='bg-white p-5 rounded-2xl border border-slate-100 flex items-center gap-4 hover:shadow-md hover:shadow-slate-100/50 hover:border-slate-200/60 transition-all duration-300'>
        <div className='w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-indigo-600'>
            {icon}
        </div>
        <div>
            <p className='text-[9px] font-black text-slate-400 uppercase tracking-widest'>{title}</p>
            <p className='text-lg font-black text-slate-800 tracking-tight mt-0.5'>{value ?? 0}</p>
        </div>
    </div>
)

const PeriodStat = ({ label, value, color = "text-slate-900", icon, trend }) => (
    <div className='flex flex-col gap-2 p-5 bg-slate-50/40 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors duration-300'>
        <div className='flex items-center justify-between'>
            <div className='text-slate-400'>{icon}</div>
            {trend && <span className='text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md'>{trend}</span>}
        </div>
        <div className='mt-2'>
            <p className='text-[9px] font-black text-slate-400 uppercase tracking-widest'>{label}</p>
            <p className={`text-lg font-black ${color} tracking-tight`}>
                ৳{Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
        </div>
    </div>
)

const ArrowRight = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
)

const CheckCircle = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
)

export default Dashboard;
