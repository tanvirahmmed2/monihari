'use client'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import React, { useContext, useState } from 'react'
import Image from 'next/image'
import { Context } from '../helper/Context'
import { ShoppingCart, Check, X, ChevronRight, PackageX } from 'lucide-react'

const VariantModal = ({ product, onClose, onConfirm }) => {
  const salePrice   = Number(product?.sale_price) || 0
  const discountAmt = Number(product?.discount_price) || 0

  const [selected, setSelected] = useState(null)

  const finalPrice = (variant) => {
    const base  = salePrice + (parseFloat(variant.price) || 0)
    const after = base - discountAmt
    return Math.max(0, after)
  }

  const handleConfirm = () => {
    if (!selected) return
    onConfirm(selected)
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, y: 60, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.97 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center gap-3 p-4 border-b border-gray-100">
            <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-gray-100">
              <Image
                src={product?.image || '/placeholder.jpg'}
                alt={product?.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-sky-500 mb-0.5">
                Select a Variant
              </p>
              <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug">
                {product?.name}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors flex-shrink-0"
            >
              <X size={15} />
            </button>
          </div>

          {/* Variant list */}
          <div className="p-4 flex flex-col gap-2 max-h-72 overflow-y-auto">
            {product.variants.map(v => {
              const outOfStock = Number(v.stock) <= 0
              const isSelected = selected?.variant_id === v.variant_id
              const price = finalPrice(v)
              const delta = parseFloat(v.price) || 0

              return (
                <button
                  key={v.variant_id}
                  disabled={outOfStock}
                  onClick={() => !outOfStock && setSelected(v)}
                  className={`
                    w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border text-left
                    transition-all duration-200
                    ${outOfStock
                      ? 'opacity-40 cursor-not-allowed border-gray-100 bg-gray-50'
                      : isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/20'
                    }
                  `}
                >
                  {/* Color swatch */}
                  {v.color && (
                    <span
                      className="w-5 h-5 rounded-full border border-gray-200 flex-shrink-0"
                      style={{ background: v.color }}
                    />
                  )}

                  {/* Name / size / color label */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">
                      {v.variant_name || [v.size, v.color].filter(Boolean).join(' / ') || `Variant #${v.variant_id}`}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {outOfStock ? (
                        <span className="flex items-center gap-1 text-red-400"><PackageX size={10} /> Out of stock</span>
                      ) : (
                        `${v.stock} in stock`
                      )}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-black text-gray-900">৳{price}</p>
                    {delta !== 0 && (
                      <p className={`text-[9px] font-bold ${delta > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {delta > 0 ? `+৳${delta}` : `-৳${Math.abs(delta)}`}
                      </p>
                    )}
                  </div>

                  {/* Selected indicator */}
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                      <Check size={9} className="text-white" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleConfirm}
              disabled={!selected}
              className={`
                w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2
                transition-all duration-200
                ${selected
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-600/10'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              <ShoppingCart size={13} />
              {selected ? `Add "${selected.variant_name || 'Selected'}" to Cart` : 'Select a variant to continue'}
              {selected && <ChevronRight size={12} />}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ─────────────────────────────────────────────
   Product Card
───────────────────────────────────────────── */
const Item = ({ product }) => {
  const { addToCart } = useContext(Context)
  const [added, setAdded]           = useState(false)
  const [showModal, setShowModal]   = useState(false)

  const hasVariants   = Array.isArray(product?.variants) && product.variants.length > 0
  const salePrice     = Number(product?.sale_price) || 0
  const discountPrice = Number(product?.discount_price) || 0
  const currentPrice  = discountPrice > 0 ? salePrice - discountPrice : salePrice
  const discountPct   = discountPrice > 0 ? Math.round((discountPrice / salePrice) * 100) : 0
  const isNew         = product?.is_new ?? true

  // Out-of-stock: for variant products check all variants; otherwise check base stock
  const isOutOfStock  = hasVariants
    ? product.variants.every(v => Number(v.stock) <= 0)
    : Number(product?.stock) <= 0

  const handleAddToCart = (e) => {
    e.preventDefault()
    if (isOutOfStock) return
    if (hasVariants) {
      setShowModal(true)
      return
    }
    addToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  const handleVariantConfirm = (variant) => {
    addToCart(product, variant)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35 }}
        className="group relative w-full flex flex-col bg-white rounded-[20px] overflow-hidden border border-slate-100/80 shadow-xs hover:-translate-y-1 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-600/5 transition-all duration-300"
      >
        <Link href={`/products/${product.slug}`} className="relative block w-full overflow-hidden bg-slate-50" style={{ aspectRatio: '1/1' }}>

          <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1">
            {isOutOfStock ? (
              <span className="bg-slate-900/90 text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md leading-none backdrop-blur-xs shadow-xs">
                Out of Stock
              </span>
            ) : (
              <>
                {discountPct > 0 && (
                  <span className="bg-rose-500 text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md leading-none shadow-xs">
                    -{discountPct}%
                  </span>
                )}
                {isNew && discountPct === 0 && (
                  <span className="bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md leading-none shadow-xs">
                    New
                  </span>
                )}
              </>
            )}
            {hasVariants && !isOutOfStock && (
              <span className="bg-violet-600 text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md leading-none shadow-xs">
                Variants
              </span>
            )}
          </div>

          <Image
            src={product?.image || '/placeholder.jpg'}
            alt={product?.name || 'Product'}
            width={400}
            height={400}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/2.5 transition-colors duration-300 pointer-events-none" />
        </Link>

        <div className="flex flex-col flex-1 p-4 gap-2.5">

          {/* Category / Brand */}
          {(product?.category_name || product?.brand_name) && (
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400/80 line-clamp-1">
              {product.category_name || product.brand_name}
            </p>
          )}

          {/* Name */}
          <Link href={`/products/${product.slug}`}>
            <h2 className="text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors line-clamp-2 leading-snug tracking-tight">
              {product?.name}
            </h2>
          </Link>

          {/* Price row */}
          <div className="flex items-center justify-between mt-auto pt-1 flex-wrap gap-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-black text-slate-950">৳{currentPrice}</span>
              {discountPct > 0 && (
                <span className="text-[9px] text-slate-400 line-through">৳{salePrice}</span>
              )}
            </div>
            {hasVariants && (
              <span className="bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                {product.variants.length} Opts
              </span>
            )}
          </div>

          {/* Add to Cart button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`
              w-full flex items-center justify-center gap-1.5
              py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider
              transition-all duration-300 cursor-pointer
              ${isOutOfStock
                ? 'bg-slate-50 text-slate-400 cursor-not-allowed border border-slate-100/50'
                : added
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10'
                  : 'bg-slate-900 text-white hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-600/10 active:scale-95'
              }
            `}
          >
            {isOutOfStock ? (
              <>
                <PackageX size={12} />
                Out of Stock
              </>
            ) : added ? (
              <>
                <Check size={12} />
                Added
              </>
            ) : (
              <>
                <ShoppingCart size={12} />
                {hasVariants ? 'Choose Variant' : 'Add to Cart'}
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Variant Modal — rendered in document root via portal-like pattern */}
      {showModal && (
        <VariantModal
          product={product}
          onClose={() => setShowModal(false)}
          onConfirm={handleVariantConfirm}
        />
      )}
    </>
  )
}

export default Item
