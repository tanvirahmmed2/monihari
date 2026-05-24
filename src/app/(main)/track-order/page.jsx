'use client'

import { useState, useContext } from 'react'
import axios from 'axios'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Package, Phone, Hash, CheckCircle2, Clock,
  XCircle, RefreshCw, ChevronDown, ChevronUp,
  ShoppingBag, CreditCard, CalendarDays, User, Loader2, Download
} from 'lucide-react'
import { generateReceipt } from '@/lib/database/print'
import { Context } from '@/components/helper/Context'

const STATUS_MAP = {
  pending:   { label: 'Pending',    color: 'text-amber-600',   bg: 'bg-amber-50',    border: 'border-amber-200',   icon: Clock },
  confirmed: { label: 'Confirmed',  color: 'text-sky-600',     bg: 'bg-sky-50',      border: 'border-sky-200',     icon: CheckCircle2 },
  shipped:   { label: 'Shipped',    color: 'text-indigo-600',  bg: 'bg-indigo-50',   border: 'border-indigo-200',  icon: RefreshCw },
  delivered: { label: 'Delivered',  color: 'text-emerald-600', bg: 'bg-emerald-50',  border: 'border-emerald-200', icon: CheckCircle2 },
  returned:  { label: 'Returned',   color: 'text-rose-600',    bg: 'bg-rose-50',     border: 'border-rose-200',    icon: RefreshCw },
  cancelled: { label: 'Cancelled',  color: 'text-red-600',     bg: 'bg-red-50',      border: 'border-red-200',     icon: XCircle },
}

const PAY_STATUS_MAP = {
  success:  { label: 'Paid',     color: 'text-emerald-600', bg: 'bg-emerald-50' },
  paid:     { label: 'Paid',     color: 'text-emerald-600', bg: 'bg-emerald-50' },
  partial:  { label: 'Partial',  color: 'text-blue-600',    bg: 'bg-blue-50' },
  unpaid:   { label: 'Unpaid',   color: 'text-red-600',     bg: 'bg-red-50' },
  pending:  { label: 'Pending',  color: 'text-amber-600',   bg: 'bg-amber-50' },
  refunded: { label: 'Refunded', color: 'text-purple-600',  bg: 'bg-purple-50' },
}

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] ?? STATUS_MAP.pending
  const Icon = s.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${s.color} ${s.bg} ${s.border}`}>
      <Icon size={12} /> {s.label}
    </span>
  )
}

const PayBadge = ({ status }) => {
  const s = PAY_STATUS_MAP[status] ?? PAY_STATUS_MAP.unpaid
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${s.color} ${s.bg}`}>
      {s.label}
    </span>
  )
}

const OrderCard = ({ order, siteData, index = 0 }) => {
  const [expanded, setExpanded] = useState(index === 0)   // auto-expand first

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      {/* Card header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full text-left px-5 py-4 flex items-start justify-between gap-3 hover:bg-gray-50/60 transition-colors"
      >
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-lg">
              #{order.order_id}
            </span>
            <StatusBadge status={order.status} />
            <PayBadge status={order.payment_status} />
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <User size={13} className="text-gray-400" />
              {order.name}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays size={13} className="text-gray-400" />
              {new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              <span className="text-[10px] text-gray-300 ml-1">
                {new Date(order.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </span>
            </span>
            <span className="flex items-center gap-1.5 font-bold text-gray-800">
              <ShoppingBag size={13} className="text-gray-400" />
              ৳{Number(order.total_amount).toLocaleString()}
            </span>
          </div>
        </div>

        <span className="text-gray-400 mt-1 flex-shrink-0">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>

      {/* Expandable details */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 px-5 py-5 flex flex-col gap-5">

              {/* Items list */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Items Ordered</p>
                <div className="flex flex-col gap-3">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={20} className="text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 line-clamp-1">{item.name}</p>
                        {item.variant_name && <span className="inline-block text-[10px] font-bold uppercase tracking-wide text-slate-500 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 mt-0.5">{item.variant_name}</span>}
                        <p className="text-xs text-gray-400">Qty: {item.quantity} × ৳{Number(item.price).toLocaleString()}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-700 flex-shrink-0">
                        ৳{(item.quantity * item.price).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>৳{Number(order.subtotal_amount).toLocaleString()}</span>
                </div>
                {Number(order.total_discount_amount) > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>−৳{Number(order.total_discount_amount).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2 mt-1">
                  <span>Total</span>
                  <span>৳{Number(order.total_amount).toLocaleString()}</span>
                </div>
              </div>

              {/* Payment info */}
              <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                  <CreditCard size={13} className="text-gray-400" />
                  {order.payment_method || 'N/A'}
                </span>
                {order.paid_amount && (
                  <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <CheckCircle2 size={13} className="text-gray-400" />
                    Paid: ৳{Number(order.paid_amount).toLocaleString()}
                  </span>
                )}
                {order.status === 'delivered' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      generateReceipt(order, siteData);
                    }}
                    className="flex items-center gap-2 ml-auto px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-[11px] font-bold rounded-lg transition-all active:scale-95 shadow-sm shadow-sky-100"
                  >
                    <Download size={13} />
                    Download Receipt
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ── Main page ───────────────────────────────────────────── */
export default function TrackOrderPage() {
  const { siteData } = useContext(Context)
  const [tab,     setTab]     = useState('orderId')   // 'orderId' | 'phone'
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)        // null = no search yet
  const [error,   setError]   = useState('')

  const handleSearch = async (e) => {
    e?.preventDefault()
    if (!input.trim()) return

    setLoading(true)
    setError('')
    setResults(null)

    try {
      const params = tab === 'orderId'
        ? { orderId: input.trim() }
        : { phone: input.trim() }

      const { data } = await axios.get('/api/order/track', { params })

      if (data.success) {
        // Normalize to always be an array
        setResults(Array.isArray(data.payload) ? data.payload : [data.payload])
      } else {
        setError(data.message || 'No order found.')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'No order found. Please check your input and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleTabSwitch = (t) => {
    setTab(t)
    setInput('')
    setResults(null)
    setError('')
  }

  return (
    <div className="w-full min-h-screen bg-linear-to-br from-slate-50 via-white to-sky-50/40 py-16 px-4">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">

        {/* ── Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center pt-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sky-500 text-white shadow-lg shadow-sky-200 mb-4">
            <Package size={28} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Track Your Order</h1>
          <p className="text-gray-500 mt-2 text-sm leading-relaxed">
            Enter your Order ID or registered phone number<br />to instantly check your order status.
          </p>
        </motion.div>

        {/* ── Search card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5"
        >
          {/* Tab switcher */}
          <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
            <button
              onClick={() => handleTabSwitch('orderId')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                tab === 'orderId'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Hash size={15} />
              By Order ID
            </button>
            <button
              onClick={() => handleTabSwitch('phone')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                tab === 'phone'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Phone size={15} />
              By Phone
            </button>
          </div>

          {/* Search input */}
          <form onSubmit={handleSearch} className="flex flex-col gap-3">
            <div className="relative">
              {tab === 'orderId'
                ? <Hash size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                : <Phone size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              }
              <input
                type={tab === 'phone' ? 'tel' : 'text'}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={tab === 'orderId' ? 'e.g. 1042' : 'e.g. 01700000000'}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 placeholder-gray-400 outline-none focus:border-sky-400 focus:ring-3 focus:ring-sky-100 transition-all"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all active:scale-[0.98] shadow-sm"
            >
              {loading ? <Loader2 size={17} className="animate-spin" /> : <Search size={17} />}
              {loading ? 'Searching...' : 'Track Order'}
            </button>
          </form>
        </motion.div>

        {/* ── Error state ── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4"
            >
              <XCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Results ── */}
        <AnimatePresence>
          {results && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  {results.length} order{results.length > 1 ? 's' : ''} found
                </p>
              </div>

              {results.map((order, i) => (
                <OrderCard key={order.order_id} order={order} siteData={siteData} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
