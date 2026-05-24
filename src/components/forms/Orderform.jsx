import axios from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Context } from '../helper/Context'
import { MdDeleteOutline } from 'react-icons/md'
import { generateReceipt } from '@/lib/database/print'
import { FaMinus, FaPlus } from 'react-icons/fa6'
import BarScanner from '../helper/BarcodeScanner'
import { FaBarcode } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Phone } from 'lucide-react'

const Orderform = ({ cartItems = [] }) => {
    const { decreaseQuantity, increaseQuantity, clearCart, addToCart, removeFromCart, setCart, customers, setIsCustomerBox, siteData } = useContext(Context)
    const [saleType, setSaleType] = useState('retail')
    const [products, setProducts] = useState([])
    const [searchTerm, setSearchTerm] = useState('')

    // Payment modal
    const [isPaymentModal, setIsPaymentModal] = useState(false)
    const [receivedAmount, setReceivedAmount] = useState(0)

    // Variant picker: holds the product awaiting variant selection
    const [pendingProduct, setPendingProduct] = useState(null)

    const [data, setData] = useState({
        phone: '019',
        extradiscount: 0,
        subTotal: 0,
        totalDiscount: 0,
        totalPrice: 0,
        transactionId: '',
        paymentMethod: 'cash',
        createdAt: new Date().toISOString().split('T')[0]
    })

    // Search functionality
    useEffect(() => {
        const fetchData = async () => {
            if (!searchTerm) {
                setProducts([])
                return
            }
            try {
                const response = await axios.get(`/api/product/search?q=${searchTerm}`, { withCredentials: true })
                setProducts(response.data.payload || [])
            } catch (error) {
                console.error(error)
                setProducts([])
            }
        }
        const delayDebounceFn = setTimeout(() => fetchData(), 300)
        return () => clearTimeout(delayDebounceFn)
    }, [searchTerm])

    const addProductToCart = (product, variant = null) => {
        if (variant) {
            if (Number(variant.stock) <= 0) { toast.error('Out of stock'); return }
            addToCart(product, variant)
        } else {
            if (product.variants?.length > 0) {
                // Has variants — open picker
                setPendingProduct(product)
                return
            }
            if (Number(product.stock) <= 0) { toast.error('Out of stock'); return }
            addToCart(product)
        }
        setSearchTerm('')
    }

    const handleBarcodeScan = async (code) => {
        if (!code) return
        try {
            const response = await axios.get(`/api/product/search?q=${code}`, { withCredentials: true })
            const foundItems = response.data.payload
            if (foundItems && foundItems.length === 1) {
                addProductToCart(foundItems[0])
                setSearchTerm('')
            }
        } catch (error) {
            console.error("Scanner lookup error:", error)
        }
    }

    const handleSaleTypeChange = (type) => {
        setSaleType(type)
    }

    const handlePriceChange = (cartItemId, newPrice) => {
        setCart(prev => ({
            ...prev,
            items: prev.items.map(item =>
                String(item.cartItemId) === String(cartItemId)
                    ? { ...item, manual_price: parseFloat(newPrice) || 0 }
                    : item
            )
        }))
    }

    // Master Calculation Effect
    useEffect(() => {
        const totals = cartItems.reduce((acc, item) => {
            const hasManualPrice = item.manual_price !== undefined;
            const basePrice = hasManualPrice ? item.manual_price : (saleType === 'retail' ? item.sale_price : item.wholesale_price);
            
            // Discount only applies to retail and when price is not manually overridden
            const discountPerUnit = (!hasManualPrice && saleType === 'retail') ? (parseFloat(item.discount_price) || 0) : 0;
            
            acc.subTotal += (parseFloat(basePrice) * (item.quantity || 0));
            acc.productDiscountTotal += (discountPerUnit * (item.quantity || 0));
            return acc;
        }, { subTotal: 0, productDiscountTotal: 0 });

        const manualDiscount = parseFloat(data.extradiscount) || 0
        const totalPrice = totals.subTotal - totals.productDiscountTotal - manualDiscount

        setData(prev => ({
            ...prev,
            subTotal: totals.subTotal,
            totalDiscount: totals.productDiscountTotal,
            totalPrice: Math.max(0, totalPrice)
        }))
    }, [cartItems, data.extradiscount, saleType])

    const handleChange = (e) => {
        const { name, value } = e.target
        setData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (cartItems.length === 0) return toast.error("Cart is empty")
        if (!data.phone) return toast.error("Please enter customer phone number")

        setReceivedAmount(data.totalPrice)
        setIsPaymentModal(true)
    }

    
    const changeAmount = (parseFloat(receivedAmount) || 0) - data.totalPrice
    const router = useRouter()


    const finalConfirm = async () => {
        const payload = {
            phone: data.phone,
            address: 'POS Sale',
            subtotal: data.subTotal,
            discount: data.totalDiscount + (parseFloat(data.extradiscount) || 0),
            total: data.totalPrice,
            paid_amount: parseFloat(receivedAmount) || 0,
            change_amount: Math.max(0, changeAmount),
            paymentMethod: data.paymentMethod,
            payment_type: 'prepaid',
            transactionId: data.transactionId,
            saleType: saleType,
            status: 'delivered',
            createdAt: data.createdAt,
            items: cartItems.map(item => {
                const hasManualPrice = item.manual_price !== undefined;
                const basePrice = hasManualPrice ? item.manual_price : (saleType === 'retail' ? item.sale_price : item.wholesale_price);
                const discountPerUnit = (!hasManualPrice && saleType === 'retail') ? (parseFloat(item.discount_price) || 0) : 0;
                
                return {
                    product_id: item.product_id,
                    variant_id: item.variant_id || null,
                    quantity: item.quantity,
                    price: (parseFloat(basePrice) - discountPerUnit)
                };
            })
        }

        try {
            const response = await axios.post('/api/order', payload, { withCredentials: true })
            toast.success(response.data.message)
            // if (generateReceipt) generateReceipt(response.data.payload, siteData)
            // console.log(response.data.payload)


            setIsPaymentModal(false)
            clearCart()
            setData({
                phone: '',
                extradiscount: 0,
                transactionId: '',
                paymentMethod: 'cash',
                subTotal: 0,
                totalDiscount: 0,
                totalPrice: 0,
                createdAt: new Date().toISOString().split('T')[0]
            })
            setSaleType('retail')
            router.push(`/dashboard/sales/pos/${response.data.payload.order_id}`)
        } catch (error) {
            toast.error(error?.response?.data?.message || "Checkout failed")
        }
    }

    return (
        <>
            <form onSubmit={handleSubmit} className='w-full flex flex-col gap-5 bg-white'>
                <div className='flex flex-col gap-3'>
                    <input
                        type="date"
                        name="createdAt"
                        value={data.createdAt}
                        onChange={handleChange}
                        className='px-4 py-2.5 border border-slate-200 rounded-xl outline-none w-full bg-slate-50/50 focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all text-xs font-bold text-slate-700'
                    />

                    <div className='flex items-center gap-2'>
                        <div className="relative flex-1">
                            <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                                type="tel"
                                name="phone"
                                value={data.phone}
                                onChange={handleChange}
                                required
                                placeholder="Customer Phone Number"
                                className='w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none bg-slate-50/50 focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all text-xs font-bold text-slate-700'
                            />
                        </div>
                    </div>
                </div>

                <div className='grid grid-cols-2 p-1 bg-slate-100/80 rounded-xl w-full'>
                    <button type="button" onClick={() => handleSaleTypeChange('retail')}
                        className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${saleType === 'retail' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'}`}>Retail Sale</button>
                    <button type="button" onClick={() => handleSaleTypeChange('wholesale')}
                        className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${saleType === 'wholesale' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500'}`}>Wholesale</button>
                </div>

                <div className="w-full flex flex-col gap-2 relative">
                    <BarScanner onScan={handleBarcodeScan} />
                    <div className="w-full flex items-center gap-3 bg-slate-50/50 border border-slate-200 px-4 py-2.5 rounded-xl focus-within:border-indigo-600 focus-within:bg-white focus-within:ring-1 focus-within:ring-indigo-600 transition-all">
                        <FaBarcode className='text-slate-400' size={16} />
                        <input
                            type="text"
                            name='searchTerm'
                            id='searchTerm'
                            onChange={(e) => setSearchTerm(e.target.value)}
                            value={searchTerm}
                            onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                            placeholder='Search products or scan barcode...'
                            className='w-full bg-transparent outline-none text-xs font-semibold'
                        />
                    </div>

                    {searchTerm.length > 0 && products && products.length > 0 && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto overflow-x-hidden">
                            {products.map((product) => {
                                const hasVariants = product.variants?.length > 0
                                const totalStock = hasVariants
                                    ? product.variants.reduce((s, v) => s + Number(v.stock), 0)
                                    : Number(product.stock)
                                return (
                                    <div
                                        key={product.product_id}
                                        onClick={() => addProductToCart(product)}
                                        className="w-full cursor-pointer flex items-center justify-between p-3.5 hover:bg-indigo-50/30 border-b border-slate-50 last:border-0 transition-colors"
                                    >
                                        <div className='flex flex-col gap-0.5'>
                                            <span className="text-xs font-bold text-slate-800">{product.name}</span>
                                            <span className='text-[9px] text-slate-400 font-extrabold uppercase tracking-wide'>
                                                {product.unit} · Stock: {totalStock}
                                                {hasVariants && <span className='text-indigo-500 ml-1'>· {product.variants.length} variants</span>}
                                            </span>
                                        </div>
                                        <span className="text-xs font-black text-indigo-600">৳{saleType === 'wholesale' ? product.wholesale_price : (product.sale_price - product.discount_price)}</span>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* ── Inline Variant Picker ── */}
                    {pendingProduct && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-indigo-100 rounded-xl shadow-xl z-50 overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 bg-indigo-50/40 border-b border-indigo-100/50">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-indigo-600">Select Variant</p>
                                    <p className="text-xs font-bold text-slate-800">{pendingProduct.name}</p>
                                </div>
                                <button onClick={() => setPendingProduct(null)} className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer">×</button>
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                                {pendingProduct.variants.map(v => {
                                    const oos = Number(v.stock) <= 0
                                    return (
                                        <div
                                            key={v.variant_id}
                                            onClick={() => {
                                                if (!oos) {
                                                    addProductToCart(pendingProduct, v)
                                                    setPendingProduct(null)
                                                }
                                            }}
                                            className={`flex items-center justify-between p-3 border-b border-slate-50 last:border-0 transition-colors ${
                                                oos ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-indigo-50/30'
                                            }`}
                                        >
                                            <div className='flex flex-col gap-0.5'>
                                                <span className="text-xs font-bold text-slate-700">{v.variant_name}</span>
                                                <span className="text-[9px] text-slate-400 font-extrabold uppercase">Stock: {v.stock}{oos && ' · Out of stock'}</span>
                                            </div>
                                            <span className="text-xs font-black text-indigo-600">
                                                ৳{Math.max(0, (parseFloat(pendingProduct.sale_price) + (parseFloat(v.price) || 0)) - (parseFloat(pendingProduct.discount_price) || 0))}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className='w-full flex flex-col gap-2 max-h-[360px] overflow-y-auto border-y border-slate-100 py-3 custom-scrollbar'>
                    <div className='w-full grid grid-cols-6 sm:grid-cols-12 gap-2 px-2 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5'>
                        <p className='col-span-2 sm:col-span-4'>Product</p>
                        <p className='col-span-2 sm:col-span-3 text-center'>Qty</p>
                        <p className='hidden sm:block col-span-2 text-center'>Rate</p>
                        <p className='col-span-1 sm:col-span-2 text-right'>Total</p>
                        <p className='col-span-1 sm:col-span-1 text-center'>Action</p>
                    </div>

                    {cartItems.length === 0 ? (
                        <div className='py-12 text-center text-slate-300 italic text-xs flex flex-col items-center gap-2'>
                            <ShoppingBag size={28} className="opacity-20 text-slate-400" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cart is empty</span>
                        </div>
                    ) : cartItems.map(item => {
                        const hasManualPrice = item.manual_price !== undefined;
                        const itemRate = hasManualPrice ? item.manual_price : (saleType === 'wholesale'
                            ? (parseFloat(item.wholesale_price) || 0)
                            : (parseFloat(item.sale_price) || 0));

                        const itemDiscount = (!hasManualPrice && saleType === 'retail')
                            ? (parseFloat(item.discount_price) || 0)
                            : 0;

                        const rowTotal = (itemRate - itemDiscount) * (item.quantity || 0);

                        return (
                            <div key={item.cartItemId} className='w-full grid grid-cols-6 sm:grid-cols-12 gap-2 p-2 rounded-xl hover:bg-slate-50 transition-all items-center'>
                                <div className='col-span-2 sm:col-span-4 flex flex-col pr-1'>
                                    <p className='text-xs font-bold text-slate-700 truncate' title={item.name}>{item.name}</p>
                                    {item.variant_name && <span className='text-[9px] text-indigo-600 font-extrabold'>{item.variant_name}</span>}
                                    <span className='sm:hidden text-[9px] text-slate-400'>@ ৳{itemRate}</span>
                                </div>

                                <div className='col-span-2 sm:col-span-3 flex items-center justify-between bg-slate-100 px-1.5 py-1 rounded-lg'>
                                    <button type='button' onClick={() => decreaseQuantity(item.cartItemId)} className='p-1 text-slate-400 hover:text-rose-500 cursor-pointer'><FaMinus size={8} /></button>
                                    <span className='text-xs font-bold text-slate-700'>{item?.quantity}</span>
                                    <button type='button' onClick={() => increaseQuantity(item.cartItemId)} className='p-1 text-slate-400 hover:text-indigo-600 cursor-pointer'><FaPlus size={8} /></button>
                                </div>

                                <div className='hidden sm:block col-span-2 text-center'>
                                    <input
                                        type="number"
                                        value={itemRate}
                                        onChange={(e) => handlePriceChange(item.cartItemId, e.target.value)}
                                        className='w-full bg-transparent text-center text-xs font-bold text-slate-600 outline-none border-b border-transparent focus:border-indigo-600'
                                        step="0.01"
                                    />
                                </div>

                                <p className='col-span-1 sm:col-span-2 text-right font-black text-slate-900 text-xs'>৳{rowTotal.toFixed(0)}</p>
                                
                                <div className='col-span-1 sm:col-span-1 flex items-center justify-center'>
                                    <button type='button' onClick={() => removeFromCart(item.cartItemId)} className='p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer'>
                                        <MdDeleteOutline size={16} />
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className='w-full flex flex-col gap-3 py-2'>
                    <div className='flex justify-between text-xs font-bold text-slate-500'>
                        <span>Sub Total</span>
                        <span className='text-slate-950 font-black'>৳{data.subTotal.toFixed(2)}</span>
                    </div>
                    {(data.totalDiscount > 0 || parseFloat(data.extradiscount) > 0) && (
                        <div className='flex justify-between text-xs font-bold text-rose-500'>
                            <span>Total Discount</span>
                            <span className="font-black">-৳{(data.totalDiscount + (parseFloat(data.extradiscount) || 0)).toFixed(2)}</span>
                        </div>
                    )}

                    <div className='flex items-center justify-between gap-4 mt-1'>
                        <span className='text-[9px] font-black text-slate-400 uppercase tracking-widest'>Extra Discount</span>
                        <div className='relative flex-1 max-w-[120px]'>
                            <input
                                type="number"
                                name="extradiscount"
                                value={data.extradiscount}
                                onChange={handleChange}
                                placeholder="0"
                                className='w-full bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg outline-none focus:border-indigo-600 focus:bg-white text-right text-xs font-bold text-slate-700 transition-all'
                            />
                            <span className='absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-300'>৳</span>
                        </div>
                    </div>
                    
                    <div className='flex items-center justify-between pt-3 border-t border-dashed border-slate-200'>
                        <label className='text-xs font-black text-slate-800 uppercase tracking-wider'>Total Amount</label>
                        <span className='text-xl font-black text-indigo-600 tracking-tight'>৳{data.totalPrice.toFixed(0)}</span>
                    </div>
                </div>

                <button className='w-full py-3.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all active:scale-[0.98] uppercase tracking-widest text-[10px] mt-2 cursor-pointer' type='submit'>
                    Complete Order
                </button>
            </form>

            {isPaymentModal && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-[300] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-100">
                        <div className="p-8 space-y-6">
                            <div className='text-center space-y-1'>
                                <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider">Confirm Payment</h2>
                                <p className='text-slate-400 text-[11px] font-medium'>Enter the amount received from customer</p>
                            </div>

                            <div className="flex flex-col gap-2 items-center justify-center py-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Payable</span>
                                <span className="text-3xl font-black text-slate-950 tracking-tight">৳{data.totalPrice.toFixed(0)}</span>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Received Amount</label>
                                <input
                                    type="number"
                                    autoFocus
                                    onFocus={(e) => e.target.select()}
                                    value={receivedAmount}
                                    onChange={(e) => setReceivedAmount(e.target.value)}
                                    className="w-full text-3xl font-black p-4 border-2 border-slate-100 rounded-2xl outline-none text-center bg-white focus:border-indigo-600 focus:bg-white transition-all text-indigo-600"
                                />
                            </div>

                            <div className={`flex justify-between items-center p-4 rounded-2xl border ${changeAmount >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${changeAmount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {changeAmount >= 0 ? 'Change Due' : 'Balance Due'}
                                </span>
                                <span className={`text-xl font-black tracking-tight ${changeAmount >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                    ৳{Math.abs(changeAmount).toFixed(0)}
                                </span>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setIsPaymentModal(false)}
                                    className="flex-1 py-3.5 font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all text-[10px] uppercase tracking-widest cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={finalConfirm}
                                    className="flex-[1.5] py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98] transition-all text-[10px] uppercase tracking-widest cursor-pointer"
                                >
                                    Confirm Sale
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Orderform;
