import React from 'react'
import ProductDetails from '@/components/page/ProductDetails'
import SameCategory from '@/components/page/SameCategory'
import { BASE_URL } from '@/lib/database/secret'

const SingleProduct = async ({ params }) => {
  const { slug } = await params
  
  let product = null;
  try {
    const res = await fetch(`${BASE_URL}/api/product/${slug}`, { method: "GET", cache: 'no-store' })
    const data = await res.json()
    product = data.payload
  } catch (error) {
    console.error("Error fetching product:", error)
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h1 className="text-4xl font-bold text-slate-800">404</h1>
        <p className="text-sm text-slate-400">The product you are looking for does not exist for this store.</p>
      </div>
    )
  }

  return (
    <div className='w-full min-h-screen flex flex-col gap-20 items-center justify-center rounded-2xl'>
      <ProductDetails key={slug} product={product} />
      <SameCategory key={`cat-${slug}`} category={product?.category_id} />
    </div>
  )
}

export default SingleProduct
