import ProductCard from '@/components/cards/ProductCard'
import React from 'react'

const Products =async () => {
  const res= await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products`,{
    method: "GET",
    cache: 'no-store'
  })
  const json= await res.json()
  const data= json.payload
  console.log(data)
  return (
    <div className='w-full min-h-screen flex flex-col items-center gap-6 py-6'>
      <h1>Products</h1>
      <div className='w-full max-w-7xl'>
        {
          data!==null? <div className='w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 p-2'>
            {
              data.map((product)=>(
                <ProductCard key={product.slug} {...product}/>
              ))
            }
          </div>: <p>No product available</p>
        }
      </div>
    </div>
  )
}

export default Products
