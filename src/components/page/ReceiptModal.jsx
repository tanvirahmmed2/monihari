'use client'
import React, { useRef, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Printer, ShoppingBag, X, MapPin, Phone, User, CreditCard, Calendar, Hash, Tag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Context } from '../helper/Context'

const ReceiptModal = ({ receipt, onClose }) => {
    const printRef = useRef(null)
    const { siteData } = useContext(Context)

    if (!receipt) return null

    const handlePrint = () => {
        const printContent = printRef.current.innerHTML
        const win = window.open('', '_blank', 'width=800,height=900')
        win.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Order Receipt #${receipt.orderId}</title>
                <meta charset="utf-8"/>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #1e293b; padding: 32px; }
                    .receipt-header { text-align: center; margin-bottom: 28px; border-bottom: 2px dashed #e2e8f0; padding-bottom: 20px; }
                    .receipt-header h1 { font-size: 22px; font-weight: 900; color: #1e293b; }
                    .receipt-header p { font-size: 12px; color: #64748b; margin-top: 4px; }
                    .badge { display: inline-block; padding: 4px 12px; background: #fef9c3; color: #854d0e; border-radius: 999px; font-size: 11px; font-weight: 700; margin-top: 8px; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0; }
                    .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
                    .info-box label { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; display: block; margin-bottom: 4px; }
                    .info-box span { font-size: 13px; font-weight: 700; color: #1e293b; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    thead tr { background: #f1f5f9; }
                    th { padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; }
                    td { padding: 10px 12px; font-size: 13px; color: #334155; border-bottom: 1px solid #f1f5f9; }
                    .variant-badge { display: inline-block; padding: 2px 8px; background: #ede9fe; color: #6d28d9; border-radius: 4px; font-size: 10px; font-weight: 700; margin-left: 6px; }
                    .totals { margin-top: 16px; border-top: 2px dashed #e2e8f0; padding-top: 16px; }
                    .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
                    .total-row.grand { font-size: 17px; font-weight: 900; color: #1e293b; border-top: 1px solid #e2e8f0; padding-top: 12px; margin-top: 8px; }
                    .total-row.green { color: #16a34a; }
                    .footer { text-align: center; margin-top: 28px; padding-top: 16px; border-top: 2px dashed #e2e8f0; font-size: 11px; color: #94a3b8; }
                </style>
            </head>
            <body>${printContent}</body>
            </html>
        `)
        win.document.close()
        win.focus()
        setTimeout(() => { win.print(); win.close() }, 400)
    }

    const fmtDate = (iso) => {
        const d = new Date(iso)
        return d.toLocaleDateString('en-BD', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    }

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden"
                    initial={{ scale: 0.92, y: 30, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.92, y: 30, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                >
                    {/* Header */}
                    <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 px-6 pt-8 pb-6 text-white shrink-0">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
                        >
                            <X size={16} />
                        </button>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                                <CheckCircle2 size={22} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Order Confirmed</p>
                                <h2 className="text-xl font-black">Thank you! 🎉</h2>
                            </div>
                        </div>
                        <p className="text-sm opacity-80 mt-2">
                            We'll call you shortly to confirm your order details.
                        </p>
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full text-xs font-bold">
                                <Hash size={11} /> #{receipt.orderId}
                            </span>
                            <span className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full text-xs font-bold">
                                <Calendar size={11} /> {fmtDate(receipt.orderDate)}
                            </span>
                            <span className="inline-flex items-center gap-1.5 bg-yellow-400/30 border border-yellow-300/30 text-yellow-100 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                                {receipt.status}
                            </span>
                        </div>
                    </div>

                    {/* Scrollable body */}
                    <div className="overflow-y-auto flex-1 p-6 space-y-5">

                        {/* Printable content */}
                        <div ref={printRef} className="hidden">
                            <div className="receipt-header">
                                <h1>{siteData.name}</h1>
                                {siteData.address ? <p>{siteData.address}</p> : ''}
                                {siteData.phone ? <p>{siteData.phone}</p> : ''}
                                <p>{fmtDate(receipt.orderDate)}</p>
                                <span className="badge">Order #{receipt.orderId} — {receipt.status.toUpperCase()}</span>
                            </div>
                            <div className="info-grid">
                                <div className="info-box"><label>Customer</label><span>{receipt.customerName}</span></div>
                                <div className="info-box"><label>Phone</label><span>{receipt.phone}</span></div>
                                <div className="info-box" style={{gridColumn:'1/-1'}}><label>Address</label><span>{receipt.address || '—'}</span></div>
                            </div>
                            <table>
                                <thead><tr>
                                    <th>Item</th><th>Variant</th><th>Qty</th><th>Unit Price</th><th>Total</th>
                                </tr></thead>
                                <tbody>
                                    {receipt.items.map((item, i) => (
                                        <tr key={i}>
                                            <td>{item.name}</td>
                                            <td>{item.variant_name ? <span className="variant-badge">{item.variant_name}</span> : '—'}</td>
                                            <td>{item.quantity}</td>
                                            <td>৳{parseFloat(item.price).toFixed(2)}</td>
                                            <td>৳{(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="totals">
                                <div className="total-row"><span>Subtotal</span><span>৳{parseFloat(receipt.subtotal).toFixed(2)}</span></div>
                                {parseFloat(receipt.discount) > 0 && <div className="total-row green"><span>Discount</span><span>-৳{parseFloat(receipt.discount).toFixed(2)}</span></div>}
                                <div className="total-row"><span>Delivery</span><span>৳{parseFloat(receipt.deliveryCharge).toFixed(2)}</span></div>
                                <div className="total-row grand"><span>Grand Total</span><span>৳{parseFloat(receipt.total).toFixed(2)}</span></div>
                            </div>
                            <div className="totals" style={{marginTop:'12px'}}>
                                <div className="total-row"><span>Payment Method</span><span>{receipt.paymentMethod}</span></div>
                                {receipt.transactionId && <div className="total-row"><span>Transaction ID</span><span>{receipt.transactionId}</span></div>}
                            </div>
                            <div className="footer"><p>Thank you for your order! We will contact you soon.</p></div>
                        </div>

                        {/* Customer Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                { icon: User, label: 'Customer', value: receipt.customerName },
                                { icon: Phone, label: 'Phone', value: receipt.phone },
                                { icon: MapPin, label: 'Address', value: receipt.address || '—', full: true },
                                ...(receipt.note ? [{ icon: Tag, label: 'Note', value: receipt.note, full: true }] : []),
                            ].map(({ icon: Icon, label, value, full }) => (
                                <div key={label} className={`flex items-start gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-4 ${full ? 'sm:col-span-2' : ''}`}>
                                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0">
                                        <Icon size={14} className="text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
                                        <p className="text-sm font-bold text-slate-800">{value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Items Table */}
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Items Ordered</p>
                            <div className="border border-slate-100 rounded-2xl overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            <th className="text-left px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Product</th>
                                            <th className="text-center px-3 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Qty</th>
                                            <th className="text-right px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Price</th>
                                            <th className="text-right px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {receipt.items.map((item, i) => (
                                            <tr key={i} className="border-b border-slate-50 last:border-0">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        {item.image && (
                                                            <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-100 shrink-0">
                                                                <Image src={item.image} alt={item.name} width={40} height={40} className="object-cover w-full h-full" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-bold text-slate-800 text-sm leading-tight">{item.name}</p>
                                                            {item.variant_name && (
                                                                <span className="inline-block mt-0.5 px-2 py-0.5 bg-violet-100 text-violet-600 text-[10px] font-bold rounded-md">
                                                                    {item.variant_name}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3 text-center font-bold text-slate-600">×{item.quantity}</td>
                                                <td className="px-4 py-3 text-right text-slate-600 font-medium">৳{parseFloat(item.price).toFixed(0)}</td>
                                                <td className="px-4 py-3 text-right font-black text-slate-900">
                                                    ৳{(parseFloat(item.price) * item.quantity).toFixed(0)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-3">
                            <div className="flex justify-between text-sm text-slate-500 font-medium">
                                <span>Subtotal</span>
                                <span>৳{parseFloat(receipt.subtotal).toFixed(2)}</span>
                            </div>
                            {parseFloat(receipt.discount) > 0 && (
                                <div className="flex justify-between text-sm text-emerald-600 font-bold">
                                    <span>Discount</span>
                                    <span>-৳{parseFloat(receipt.discount).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm text-slate-500 font-medium">
                                <span>Delivery Charge</span>
                                <span>৳{parseFloat(receipt.deliveryCharge).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-black text-slate-900 border-t border-slate-200 pt-3 mt-1">
                                <span>Grand Total</span>
                                <span className="text-primary">৳{parseFloat(receipt.total).toFixed(2)}</span>
                            </div>

                            {/* Payment */}
                            <div className="flex items-center gap-2 pt-2 border-t border-slate-200 mt-2">
                                <CreditCard size={14} className="text-slate-400" />
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                    {receipt.paymentMethod}
                                    {receipt.transactionId && ` — ${receipt.transactionId}`}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="shrink-0 px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3 bg-white">
                        <button
                            onClick={handlePrint}
                            className="flex-1 flex items-center justify-center gap-2.5 py-3 border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-sm rounded-xl transition-all active:scale-95"
                        >
                            <Printer size={16} />
                            Print Receipt
                        </button>
                        <Link
                            href="/products"
                            onClick={onClose}
                            className="flex-1 flex items-center justify-center gap-2.5 py-3 bg-primary text-white font-bold text-sm rounded-xl hover:bg-slate-900 transition-all active:scale-95 shadow-md shadow-primary/20"
                        >
                            <ShoppingBag size={16} />
                            Continue Shopping
                        </Link>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

export default ReceiptModal
