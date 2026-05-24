'use client'

import Item from "@/components/card/Item"
import AddCutomerForm from "@/components/forms/AddCustomerForm"
import { Context } from "@/components/helper/Context"
import SalesCart from "@/components/page/SalesCart"
import axios from "axios"
import { useContext, useEffect, useState } from "react"



const PosPage = () => {

  const { isCustomerBox, categories } = useContext(Context)
  const [categoryId, setCategoryId] = useState('')
  const [products, setProducts] = useState([])

  const handleCategoryChange = (e) => {
    setCategoryId(e.target.value)
  }

  useEffect(()=>{
    if (!categoryId) {
    setProducts([]); 
    return;
  }
    const fetchProduct=async()=>{
      try {
        const res= await axios.get(`/api/product/category/${categoryId}`, { withCredentials: true })
        setProducts(res.data.payload)
      } catch (error) {
        setProducts([])
        
      }
    }
    fetchProduct()
  },[categoryId])
  
  return (
    <div className="w-full flex flex-col xl:flex-row gap-8 relative items-start">
      {
        isCustomerBox === true && <div className='fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[200] p-4 animate-in fade-in duration-200'>
          <div className='bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md'>
            <AddCutomerForm />
          </div>
        </div>
      }
      
      <div className="w-full xl:w-[420px] shrink-0">
        <SalesCart />
      </div>

      <div className="flex-1 flex flex-col gap-6 w-full">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <select
            onChange={handleCategoryChange}
            className='w-full bg-slate-50 border border-slate-200/60 px-4 py-3 rounded-xl outline-none focus:border-indigo-600 focus:bg-white transition-all text-xs font-bold text-slate-700 cursor-pointer'
          >
            <option value="">Filter by Category</option>
            {categories.length > 0 && categories.map((cat) => (
              <option value={cat.category_id} key={cat.category_id}>
                {cat?.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-h-[500px]">
          {products.length < 1 ? (
            <div className="w-full h-80 border border-dashed border-slate-200/80 rounded-3xl flex flex-col items-center justify-center text-slate-400 gap-2 bg-slate-50/20">
              <p className="font-extrabold uppercase tracking-widest text-[10px]">Select a category to view products</p>
            </div>
          ) : (
            <div className='w-full grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4'>
              {products.map(product => (
                <Item product={product} key={product.product_id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PosPage
