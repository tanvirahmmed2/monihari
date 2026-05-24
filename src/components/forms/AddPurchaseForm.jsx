'use client'
import React, { useContext, useEffect, useState } from 'react'
import { Context } from '../helper/Context'
import { FaPlus, FaMinus, FaTrash, FaFileInvoiceDollar, FaBarcode } from 'react-icons/fa6'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import BarScanner from '../helper/BarcodeScanner'
import { useRouter } from 'next/navigation'

const AddPurchaseForm = () => {
    const {
        purchaseItems,
        setPurchaseItems,
        removeFromPurchase,
        clearPurchase,
        setIsSupplierBox,
        suppliers,
        addToPurchase 
    } = useContext(Context)

    const [formData, setFormData] = useState({
        supplier_id: '',
        invoice_no: '',
        extra_discount: 0,
        payment_method: 'cash',
        transaction_id: '',
        note: ''
    })

    const [products, setProducts] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    // Variant picker for purchase
    const [pendingProduct, setPendingProduct] = useState(null)

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            const fetchData = async () => {
                if (!searchTerm) {
                    setProducts([])
                    return
                }
                try {
                    const response = await axios.get(`/api/product/search?q=${searchTerm}`, { withCredentials: true })
                    setProducts(response.data.payload || [])
                } catch (error) {
                    setProducts([])
                }
            }
            fetchData()
        }, 300)
        return () => clearTimeout(delayDebounceFn)
    }, [searchTerm])

    const handleBarcodeScan = async (code) => {
        if (!code) return
        try {
            const response = await axios.get(`/api/product/search?q=${code}`, { withCredentials: true })
            const foundItems = response.data.payload
            if (foundItems && foundItems.length === 1) {
                const p = foundItems[0]
                if (p.variants?.length > 0) {
                    setPendingProduct(p)
                } else {
                    addToPurchase(p)
                    toast.success(`${p.name} added`)
                }
                setSearchTerm('')
            } else {
                setSearchTerm(code)
            }
        } catch (error) {
            console.error("Scanner error:", error)
        }
    }

    const handleSearchSelect = (product) => {
        if (product.variants?.length > 0) {
            setPendingProduct(product)
            setSearchTerm('')
        } else {
            addToPurchase(product)
            setSearchTerm('')
        }
    }

    const [totals, setTotals] = useState({ subtotal: 0, total: 0 })

    useEffect(() => {
        const sub = purchaseItems.reduce((acc, item) => {
            return acc + ((parseFloat(item.purchase_price) || 0) * (parseFloat(item.quantity) || 0))
        }, 0)
        const disc = parseFloat(formData.extra_discount) || 0
        setTotals({ subtotal: sub, total: Math.max(0, sub - disc) })
    }, [purchaseItems, formData.extra_discount])

    const handleItemUpdate = (key, field, value) => {
        setPurchaseItems(prev => prev.map(item =>
            (item._key === key || String(item.product_id) === String(key))
                ? { ...item, [field]: value }
                : item
        ))
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }
    const router=useRouter()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.supplier_id) return toast.error("Please select a supplier")
        if (purchaseItems.length === 0) return toast.error("Please add products")

        try {
            const payload = {
                ...formData,
                supplier_id: Number(formData.supplier_id),
                subtotal_amount: totals.subtotal,
                total_amount: totals.total,
                items: purchaseItems
            }
            const response = await axios.post('/api/purchase', payload, { withCredentials: true })
            toast.success(response.data.message)
            setFormData({ supplier_id: '', invoice_no: '', extra_discount: 0, payment_method: 'cash', transaction_id: '', note: '' })
            setSearchTerm(''); setProducts([]); clearPurchase()
            router.push(`/dashboard/manager/purchase/${response.data.purchase_id}`)

        } catch (error) {
            toast.error(error.response?.data?.message || "Error saving purchase")
        }
    }

    return (
        <div className='w-full flex flex-col gap-4'>
            <div className="w-full flex flex-col items-center gap-4 relative">
                <BarScanner onScan={handleBarcodeScan} />
                
                <div className="w-full flex flex-row items-center justify-between gap-4 border-b-2 p-4 bg-white z-20">
                    <p className='font-bold'>Find item</p>
                    <div  className='w-auto flex flex-row items-center justify-between px-2 border border-sky-400'>
                        <FaBarcode className='text-2xl text-sky-600'/>
                        <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search product name or barcode..."
                        className='w-full max-w-md  px-4 p-1 rounded-sm outline-none'
                    />
                    </div>
                </div>

                {searchTerm.length > 0 && (
                    <div className="w-full flex flex-col gap-2 items-center justify-center absolute bg-white top-full border">
                        {products.length > 0 ? products.map((product) => (
                            <div
                                onClick={() => handleSearchSelect(product)}
                                key={product.product_id}
                                className="w-full flex flex-row even:bg-gray-200 items-center justify-center p-1"
                            >
                                <div className="flex-1">
                                    <p className="font-bold text-gray-800">{product.name}</p>
                                    <p className="text-xs text-gray-500 font-mono">
                                        {product.barcode || 'No Barcode'}
                                        {product.variants?.length > 0 && <span className="text-violet-500 ml-2">· {product.variants.length} variants</span>}
                                    </p>
                                </div>
                                <p className="flex-1 text-center font-semibold text-sky-600">৳{product.purchase_price}</p>
                            </div>
                        )) : <div className="p-4 text-center text-gray-400">No products found</div>}
                    </div>
                )}

                {/* ── Inline Variant Picker ── */}
                {pendingProduct && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white border border-violet-200 rounded-xl shadow-xl z-50 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 bg-violet-50 border-b border-violet-100">
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-violet-500">Select Variant to Purchase</p>
                                <p className="text-sm font-bold text-gray-800">{pendingProduct.name}</p>
                            </div>
                            <button onClick={() => setPendingProduct(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                            {pendingProduct.variants.map(v => (
                                <div
                                    key={v.variant_id}
                                    onClick={() => {
                                        addToPurchase(pendingProduct, v)
                                        setPendingProduct(null)
                                        toast.success(`${pendingProduct.name} (${v.variant_name}) added`)
                                    }}
                                    className="flex items-center justify-between p-3 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-violet-50 transition-colors"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-800">{v.variant_name}</span>
                                        <span className="text-xs text-gray-400">Current stock: {v.stock}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-sky-600">৳{pendingProduct.purchase_price}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="w-full mx-auto p-4 flex flex-col gap-6 bg-white min-h-screen">
                {/* Header Section */}
                <div className="flex items-center gap-3 border-b pb-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><FaFileInvoiceDollar size={24} /></div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Product Purchase</h1>
                        <p className="text-xs text-gray-500">Add stock and record supplier invoice</p>
                    </div>
                </div>

                {/* Supplier and Invoice Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Supplier</label>
                        <div className="flex gap-2">
                            <select name="supplier_id" required onChange={handleChange} value={formData.supplier_id} className="w-full bg-white border border-gray-200 p-2 rounded-lg text-sm outline-none">
                                <option value="">--Select Supplier--</option>
                                {suppliers.map((s) => (<option value={s.supplier_id} key={s.supplier_id}>{s.name}</option>))}
                            </select>
                            <button type="button" onClick={() => setIsSupplierBox(true)} className="px-4 bg-sky-600 text-white rounded-lg text-[10px] font-bold">NEW</button>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Invoice Number</label>
                        <input type="text" name="invoice_no" className="w-full border border-gray-200 px-4 py-2 rounded-lg text-sm bg-white outline-none" onChange={handleChange} value={formData.invoice_no} placeholder="#PUR-2024" />
                    </div>
                </div>

                {/* Purchase Items List */}
                <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-bold text-gray-700 flex justify-between px-1">
                        Items List
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px]">{purchaseItems.length} Products</span>
                    </h3>

                    {purchaseItems.length > 0 ? purchaseItems.map((item) => (
                        <div key={item._key || item.product_id} className="grid grid-cols-12 items-center gap-3 px-4 py-2 even:bg-gray-50 border border-gray-100 rounded-2xl">
                            <div className="col-span-12 lg:col-span-4">
                                <p className="text-sm font-bold text-gray-800 truncate">{item.name}</p>
                                {item.variant_name && <p className="text-[10px] text-violet-500 font-bold">{item.variant_name}</p>}
                                <p className="text-[10px] text-gray-400">ID: {item.product_id}</p>
                            </div>
                            <div className="col-span-4 lg:col-span-2">
                                <label className="text-[9px] font-bold text-gray-400 uppercase block">Unit Price</label>
                                <input type="number" value={item.purchase_price} onChange={(e) => handleItemUpdate(item._key || item.product_id, 'purchase_price', e.target.value)} className="w-full border rounded-md px-2 py-1 text-sm outline-sky-400" />
                            </div>
                            <div className="col-span-4 lg:col-span-2">
                                <label className="text-[9px] font-bold text-gray-400 uppercase block">Qty</label>
                                <input type="number" min="1" value={item.quantity} onChange={(e) => handleItemUpdate(item._key || item.product_id, 'quantity', e.target.value)} className="w-full border rounded-md px-2 py-1 text-sm outline-sky-400" />
                            </div>
                            <div className="col-span-3 lg:col-span-3 text-right">
                                <label className="text-[9px] font-bold text-gray-400 uppercase block">Subtotal</label>
                                <p className="text-sm font-black text-gray-800">৳{((item.purchase_price || 0) * (item.quantity || 0)).toFixed(2)}</p>
                            </div>
                            <div className="col-span-1 flex justify-end">
                                <button type="button" onClick={() => removeFromPurchase(item._key || item.product_id)} className="text-red-300 hover:text-red-600"><FaTrash size={14} /></button>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 text-sm">List is empty</div>
                    )}
                </div>

                {/* Checkout Footer */}
                {/* Checkout Footer */}
                <div className="w-full md:w-80 ml-auto flex flex-col gap-3 p-6 bg-slate-900 rounded-3xl mt-6 shadow-xl shadow-slate-900/20 text-white">
                    <div className="flex justify-between items-center text-sm text-slate-300 font-medium">
                        <span>Subtotal</span>
                        <span className="font-mono">৳{totals.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-slate-300 font-medium">
                        <span>Discount</span>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">৳</span>
                            <input 
                                type="number" 
                                name="extra_discount" 
                                value={formData.extra_discount} 
                                onChange={handleChange} 
                                className="w-24 bg-slate-800 border border-slate-700 text-right rounded-xl pl-6 pr-3 py-1.5 text-white font-mono outline-none focus:border-sky-500 transition-colors" 
                                onFocus={(e) => e.target.select()} 
                            />
                        </div>
                    </div>
                    <div className="h-px bg-slate-800 my-1"></div>
                    <div className="flex justify-between items-end">
                        <span className="font-bold text-slate-200">Grand Total</span>
                        <span className="text-3xl font-black text-sky-400 font-mono tracking-tight">৳{totals.total.toFixed(2)}</span>
                    </div>
                    <button type="submit" className="w-full bg-sky-500 hover:bg-sky-400 text-white p-3.5 rounded-xl font-bold text-sm mt-2 transition-all shadow-lg shadow-sky-500/20 active:scale-[0.98] flex justify-center items-center gap-2">
                        Complete Purchase
                    </button>
                </div>
            </form>
        </div>
    )
}

export default AddPurchaseForm
