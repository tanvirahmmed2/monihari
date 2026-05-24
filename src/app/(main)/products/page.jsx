'use client'

import Item from "@/components/card/Item"
import { Context } from "@/components/helper/Context"
import axios from "axios"
import { useEffect, useState, useContext, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft, ChevronRight, Loader2,
  SlidersHorizontal, Tag, ArrowUpDown, DollarSign, X, ChevronDown
} from "lucide-react"

const PRICE_RANGES = [
  { label: 'All prices',   min: '',    max: '' },
  { label: 'Under ৳500',   min: '',    max: '500' },
  { label: '৳500 – ৳1,000', min: '500',  max: '1000' },
  { label: '৳1,000 – ৳2,500', min: '1000', max: '2500' },
  { label: '৳2,500 – ৳5,000', min: '2500', max: '5000' },
  { label: 'Above ৳5,000', min: '5000', max: '' },
]

const SORT_OPTIONS = [
  { label: 'Latest',        value: 'latest' },
  { label: 'Price: Low → High', value: 'price_asc' },
  { label: 'Price: High → Low', value: 'price_desc' },
]

/* ─── Sidebar section wrapper ────────────────────────────── */
const FilterSection = ({ title, icon: Icon, children }) => (
  <div className="border-b border-gray-100 pb-5 mb-5 last:border-0 last:mb-0 last:pb-0">
    <div className="flex items-center gap-2 mb-3">
      <Icon size={14} className="text-sky-500" />
      <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{title}</span>
    </div>
    {children}
  </div>
)

/* ─── Main component ─────────────────────────────────────── */
const ProductsPage = () => {
  const { categories } = useContext(Context)

  const [products,    setProducts]    = useState([])
  const [category,    setCategory]    = useState('')
  const [sort,        setSort]        = useState('latest')
  const [priceRange,  setPriceRange]  = useState({ min: '', max: '' })
  const [page,        setPage]        = useState(1)
  const [totalPages,  setTotalPages]  = useState(1)
  const [totalItems,  setTotalItems]  = useState(0)
  const [loading,     setLoading]     = useState(true)
  const [drawerOpen,  setDrawerOpen]  = useState(false)  // mobile filter drawer

  /* active filter count (for badge) */
  const activeFilters = [
    category !== '',
    sort !== 'latest',
    priceRange.min !== '' || priceRange.max !== '',
  ].filter(Boolean).length

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await axios.get('/api/product/filter', {
        params: {
          category,
          sort,
          minPrice: priceRange.min || undefined,
          maxPrice: priceRange.max || undefined,
          page,
        }
      })
      setProducts(data.payload || [])
      setTotalPages(data.pagination.totalPages)
      setTotalItems(data.pagination.totalItems)
    } catch (err) {
      console.error(err)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [category, sort, priceRange, page])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  /* Reset page whenever a filter changes */
  const applyFilter = (fn) => { fn(); setPage(1) }

  const clearAllFilters = () => {
    setCategory('')
    setSort('latest')
    setPriceRange({ min: '', max: '' })
    setPage(1)
  }

  const FilterPanel = () => (
    <div className="flex flex-col">

      {activeFilters > 0 && (
        <button
          onClick={clearAllFilters}
          className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600 transition-colors self-start"
        >
          <X size={13} /> Clear all filters
        </button>
      )}

      <FilterSection title="Category" icon={Tag}>
        <ul className="flex flex-col gap-1">
          <li>
            <button
              onClick={() => applyFilter(() => setCategory(''))}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 font-medium
                ${category === ''
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-sky-600'}`}
            >
              All Categories
            </button>
          </li>
          {categories?.map(cat => (
            <li key={cat.category_id}>
              <button
                onClick={() => applyFilter(() => setCategory(cat.category_id))}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 font-medium
                  ${category === cat.category_id
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-sky-600'}`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </FilterSection>

      {/* Price range */}
      <FilterSection title="Price Range" icon={DollarSign}>
        <ul className="flex flex-col gap-1">
          {PRICE_RANGES.map(range => {
            const active = priceRange.min === range.min && priceRange.max === range.max
            return (
              <li key={range.label}>
                <button
                  onClick={() => applyFilter(() => setPriceRange({ min: range.min, max: range.max }))}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 font-medium
                    ${active
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-sky-600'}`}
                >
                  {range.label}
                </button>
              </li>
            )
          })}
        </ul>
      </FilterSection>

      {/* Sort */}
      <FilterSection title="Sort By" icon={ArrowUpDown}>
        <ul className="flex flex-col gap-1">
          {SORT_OPTIONS.map(opt => (
            <li key={opt.value}>
              <button
                onClick={() => applyFilter(() => setSort(opt.value))}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 font-medium
                  ${sort === opt.value
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-sky-600'}`}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      </FilterSection>
    </div>
  )

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4 ">
      <div className="w-full mx-auto px-4">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between py-6 border-b border-gray-100 mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">All Products</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {loading ? '...' : `${totalItems} item${totalItems !== 1 ? 's' : ''} found`}
            </p>
          </div>

          {/* Mobile filter trigger */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 shadow-sm active:scale-95 transition-transform relative"
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeFilters > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-sky-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {activeFilters}
              </span>
            )}
          </button>
        </div>

        {/* ── Mobile: compact select filters ── */}
        <div className="lg:hidden flex flex-col gap-3 mb-6">
          {/* Row 1: Category + Sort */}
          <div className="grid grid-cols-2 gap-2">
            {/* Category select */}
            <div className="relative">
              <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
              <select
                value={category}
                onChange={e => applyFilter(() => setCategory(e.target.value))}
                className="w-full pl-8 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 appearance-none outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories?.map(cat => (
                  <option value={cat.category_id} key={cat.category_id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Sort select */}
            <div className="relative">
              <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
              <select
                value={sort}
                onChange={e => applyFilter(() => setSort(e.target.value))}
                className="w-full pl-8 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 appearance-none outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all cursor-pointer"
              >
                {SORT_OPTIONS.map(opt => (
                  <option value={opt.value} key={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Price */}
          <div className="relative">
            <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
            <select
              value={`${priceRange.min}|${priceRange.max}`}
              onChange={e => {
                const [min, max] = e.target.value.split('|')
                applyFilter(() => setPriceRange({ min, max }))
              }}
              className="w-full pl-8 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 appearance-none outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all cursor-pointer"
            >
              {PRICE_RANGES.map(r => (
                <option value={`${r.min}|${r.max}`} key={r.label}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Active filter chips */}
          {activeFilters > 0 && (
            <button
              onClick={clearAllFilters}
              className="self-start flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 text-xs font-semibold rounded-full border border-red-100 hover:bg-red-100 transition-colors active:scale-95"
            >
              <X size={12} /> Clear filters
            </button>
          )}
        </div>

        {/* ── Layout: sidebar (lg+) + product grid ── */}
        <div className="flex gap-8 items-start">

          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-60 flex-shrink-0 sticky top-24 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-sky-500" />
                <span className="text-sm font-black text-gray-800 uppercase tracking-widest">Filters</span>
              </div>
              {activeFilters > 0 && (
                <span className="text-xs bg-sky-100 text-sky-600 font-bold px-2 py-0.5 rounded-full">
                  {activeFilters} active
                </span>
              )}
            </div>
            <FilterPanel />
          </aside>

          {/* Products area */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">

            {loading ? (
              <div className="w-full flex flex-col items-center justify-center py-24 gap-3">
                <Loader2 className="animate-spin text-sky-500" size={32} />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full py-24 text-center bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center gap-3"
              >
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
                  <SlidersHorizontal size={24} className="text-gray-300" />
                </div>
                <p className="text-gray-500 font-semibold">No products match your filters.</p>
                <button onClick={clearAllFilters} className="text-sky-500 text-sm font-semibold hover:underline">
                  Clear all filters
                </button>
              </motion.div>
            ) : (
              <>
                <motion.div
                  layout
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                >
                  <AnimatePresence mode="popLayout">
                    {products.map(product => (
                      <Item product={product} key={product.product_id} />
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <div className="flex items-center gap-1 bg-white p-1.5 rounded-xl shadow-sm border border-gray-100">
                      <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="p-1.5 text-gray-600 hover:text-sky-500 disabled:opacity-30 transition-all active:scale-90"
                      >
                        <ChevronLeft size={20} />
                      </button>

                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(num => {
                            if (page <= 3) return num <= 5
                            if (page >= totalPages - 2) return num >= totalPages - 4
                            return num >= page - 2 && num <= page + 2
                          })
                          .map(num => (
                            <button
                              key={num}
                              onClick={() => setPage(num)}
                              className={`w-9 h-9 rounded-lg font-bold text-xs transition-all ${
                                page === num
                                  ? 'bg-sky-500 text-white shadow-sm'
                                  : 'text-gray-400 hover:bg-sky-50 hover:text-sky-500'
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                      </div>

                      <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="p-1.5 text-gray-600 hover:text-sky-500 disabled:opacity-30 transition-all active:scale-90"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile filter drawer (slide-up sheet) ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            />
            {/* Sheet */}
            <motion.div
              key="drawer"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl p-6 pb-10 max-h-[85vh] overflow-y-auto lg:hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-sky-500" />
                  <h2 className="text-base font-black text-gray-800">Filters</h2>
                  {activeFilters > 0 && (
                    <span className="text-xs bg-sky-100 text-sky-600 font-bold px-2 py-0.5 rounded-full">
                      {activeFilters} active
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors active:scale-90"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drag handle */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-200 rounded-full" />

              <FilterPanel />

              <button
                onClick={() => setDrawerOpen(false)}
                className="mt-6 w-full py-3 bg-gray-900 text-white font-bold rounded-xl text-sm active:scale-95 transition-transform"
              >
                Show results ({totalItems})
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProductsPage
