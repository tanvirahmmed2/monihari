'use client'
import React, { useState, useContext } from 'react'
import Image from 'next/image'
import { CiShoppingCart } from "react-icons/ci"
import { Context } from '../helper/Context'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle } from 'lucide-react'

const ProductDetails = ({ product }) => {
    const { addToCart } = useContext(Context)
    const hasVariants = product?.variants && product.variants.length > 0

    // No auto-selection — user must explicitly choose a variant
    const [selectedVariant, setSelectedVariant] = useState(null)
    const [addedFeedback, setAddedFeedback] = useState(false)

    // ── Stock logic ──────────────────────────────────────────────
    // Has variants + variant selected  → use that variant's stock
    // Has variants + none selected     → sum of all variant stocks (for display)
    // No variants at all               → use product.stock directly
    const currentStock = hasVariants
        ? (selectedVariant ? (Number(selectedVariant.stock) || 0) : product.variants.reduce((s, v) => s + (Number(v.stock) || 0), 0))
        : (Number(product.stock) || 0)

    // ── Price logic (variant.price is a ±delta from product.sale_price) ────────
    const basePrice = (parseFloat(product.sale_price) || 0)
    const baseDiscount = (parseFloat(product.discount_price) || 0)

    const currentPrice = selectedVariant
        ? basePrice + (parseFloat(selectedVariant.price) || 0) - baseDiscount  // base ± delta − discount
        : hasVariants
            ? null                        // no selection yet — show base below
            : basePrice - baseDiscount    // no-variant product

    const isOutOfStock = currentStock <= 0
    // Disabled if: out of stock, OR product has variants but none selected
    const isAddDisabled = isOutOfStock || (hasVariants && !selectedVariant)

    const handleSelectVariant = (v) => setSelectedVariant(v)

    const handleAddToCart = () => {
        if (isAddDisabled) return
        addToCart(product, selectedVariant)
        setAddedFeedback(true)
        setTimeout(() => setAddedFeedback(false), 1800)
    }

    return (
        <div className='w-full md:w-5/6 lg:w-3/4 mx-auto flex flex-col lg:flex-row gap-12 bg-white m-6 p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100'>

            {/* Left: Product Image */}
            <div className='w-full lg:w-1/2'>
                <div className='relative aspect-square overflow-hidden rounded-3xl bg-slate-50 border border-slate-100 shadow-inner group'>
                    <div className='absolute right-4 top-4 z-10'>
                        {!isOutOfStock ? (
                            <span className='text-[10px] font-black uppercase tracking-[0.2em] text-white py-2 px-4 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30'>
                                In Stock
                            </span>
                        ) : (
                            <span className='text-[10px] font-black uppercase tracking-[0.2em] text-white py-2 px-4 rounded-full bg-rose-500 shadow-lg shadow-rose-500/30'>
                                Out of Stock
                            </span>
                        )}
                    </div>

                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={product.image}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.4 }}
                            className="relative w-full h-full"
                        >
                            <Image
                                src={product.image}
                                alt={product?.name}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Right: Product Info */}
            <div className='w-full lg:w-1/2 flex flex-col justify-between py-2'>
                <div className="space-y-8">

                    {/* Category & Brand */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded-full">
                                {product.category_name}
                            </span>
                            {product.brand_name && (
                                <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full">
                                    {product.brand_name}
                                </span>
                            )}
                        </div>
                        <h1 className='text-2xl md:text-4xl font-black text-slate-900 leading-[1.1] tracking-tight'>
                            {product.name}
                        </h1>
                    </div>

                    {/* Variant Selector — required if product has variants */}
                    {hasVariants && (
                        <div className='space-y-3'>
                            <div className='flex items-center gap-2'>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Variant</p>
                                {!selectedVariant && (
                                    <span className='flex items-center gap-1 text-[10px] font-bold text-amber-500'>
                                        <AlertCircle size={11} />
                                        Required
                                    </span>
                                )}
                                {selectedVariant && (
                                    <span className='flex items-center gap-1 text-[10px] font-bold text-emerald-500'>
                                        <CheckCircle2 size={11} />
                                        {selectedVariant.variant_name}
                                    </span>
                                )}
                            </div>
                            <div className='flex flex-wrap gap-2'>
                                {product.variants.map((v) => (
                                    <button
                                        key={v.variant_id}
                                        type='button'
                                        onClick={() => handleSelectVariant(v)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all duration-200 ${
                                            selectedVariant?.variant_id === v.variant_id
                                                ? 'border-primary bg-primary text-white shadow-md shadow-primary/20'
                                                : 'border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
                                        } ${v.stock <= 0 ? 'opacity-40 cursor-not-allowed line-through' : 'cursor-pointer'}`}
                                        disabled={v.stock <= 0}
                                    >
                                        {v.variant_name}
                                        {/* Show delta: +৳50 or -৳30 */}
                                        {(() => {
                                            const delta = parseFloat(v.price) || 0
                                            if (delta === 0) return null
                                            return (
                                                <span className='ml-1.5 text-xs opacity-80 font-black'>
                                                    {delta > 0 ? `+৳${delta.toFixed(0)}` : `-৳${Math.abs(delta).toFixed(0)}`}
                                                </span>
                                            )
                                        })()}
                                    </button>
                                ))}
                            </div>

                            {/* Prompt to select */}
                            {!selectedVariant && (
                                <p className='text-xs text-amber-600 font-semibold bg-amber-50 border border-amber-200 rounded-xl px-3 py-2'>
                                    ⚠ Please select a variant before adding to cart.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Price & Stock */}
                    <div className='flex items-center justify-between pt-8 border-t border-slate-100'>
                        <div className='flex flex-col'>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Price</p>
                            {currentPrice !== null ? (
                                <div className="flex items-baseline gap-3">
                                    <p className='font-black text-4xl text-slate-900 tracking-tighter'>
                                        ৳{currentPrice.toFixed(0)}
                                    </p>
                                    {!selectedVariant && !hasVariants && product?.discount_price > 0 && (
                                        <p className='text-slate-400 text-sm line-through font-medium'>৳{product.sale_price}</p>
                                    )}
                                </div>
                            ) : (
                                // Has variants but none selected — show base price (with discount if any)
                                <div className='flex flex-col gap-1'>
                                    <div className='flex items-baseline gap-2'>
                                        <p className='font-black text-4xl text-slate-900 tracking-tighter'>
                                            ৳{(basePrice - baseDiscount).toFixed(0)}
                                        </p>
                                        {baseDiscount > 0 && (
                                            <p className='text-slate-400 text-sm line-through font-medium'>৳{basePrice.toFixed(0)}</p>
                                        )}
                                    </div>
                                    {/* Show variant delta range as a hint */}
                                    {(() => {
                                        const deltas = product.variants.map(v => parseFloat(v.price) || 0)
                                        const minD = Math.min(...deltas)
                                        const maxD = Math.max(...deltas)
                                        if (minD === 0 && maxD === 0) return null
                                        const fmt = (d) => d >= 0 ? `+৳${d.toFixed(0)}` : `-৳${Math.abs(d).toFixed(0)}`
                                        return (
                                            <p className='text-xs text-slate-400 font-semibold'>
                                                Variant adjustment: {fmt(minD)}{minD !== maxD ? ` to ${fmt(maxD)}` : ''}
                                            </p>
                                        )
                                    })()}
                                </div>
                            )}
                        </div>
                        <div className='text-right'>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                {hasVariants && !selectedVariant ? 'Total Stock' : 'Available'}
                            </p>
                            <p className={`text-xl font-black ${isOutOfStock ? 'text-rose-500' : 'text-slate-900'}`}>
                                {currentStock} <span className="text-sm font-bold text-slate-400 uppercase ml-0.5">{product.unit}</span>
                            </p>
                        </div>
                    </div>

                    {/* Add to Cart Button */}
                    <div className="flex flex-col gap-3">
                        <motion.button
                            onClick={handleAddToCart}
                            disabled={isAddDisabled}
                            whileTap={!isAddDisabled ? { scale: 0.97 } : {}}
                            className={`w-full py-3.5 rounded-xl flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest transition-all duration-300 ${
                                isAddDisabled
                                    ? 'bg-slate-100 cursor-not-allowed text-slate-400'
                                    : addedFeedback
                                        ? 'bg-emerald-500 cursor-pointer text-white shadow-xl shadow-emerald-500/20'
                                        : 'bg-primary cursor-pointer text-white hover:bg-slate-900 shadow-xl shadow-primary/20 hover:shadow-slate-900/20'
                            }`}
                        >
                            <AnimatePresence mode='wait'>
                                {addedFeedback ? (
                                    <motion.span
                                        key="done"
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        className='flex items-center gap-2'
                                    >
                                        <CheckCircle2 size={18} />
                                        Added to Cart!
                                    </motion.span>
                                ) : (
                                    <motion.span
                                        key="add"
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        className='flex items-center gap-2'
                                    >
                                        {isOutOfStock
                                            ? 'Out of Stock'
                                            : hasVariants && !selectedVariant
                                                ? 'Select a Variant First'
                                                : 'Add to Cart'}
                                        <CiShoppingCart className='text-2xl stroke-2' />
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    </div>

                    {/* Description */}
                    <div className="space-y-3 pt-6 border-t border-slate-100">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-400">Description</h4>
                        <p className='text-slate-600 leading-relaxed text-sm font-medium'>
                            {product.description || "Indulge in our premium quality product, crafted with excellence."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductDetails
