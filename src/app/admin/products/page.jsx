import AddProduct from '@/components/cards/AddProduct'
import ProductCard from '@/components/cards/ProductCard';
import React from 'react'

const Products = async() => {

   const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products`, {
    method: "GET",
    cache: "no-store",
  });

  const json = await res.json();
  const data = json.payload;

  return (
    <div className='w-full min-h-screen flex flex-col items-center justify-center gap-6'>
      <h1 className='text-2xl font-semibold text-center'>Welcome to product page</h1>
      <div className='w-full flex flex-col items-center justify-center gap-4'>
        <h1 className='text-xl font-semibold text-center'>Add Product</h1>
        <AddProduct/>
      </div>
      
      <div className='w-full flex flex-col items-center justify-center gap-4'>
        <h1 className='text-xl font-semibold text-center'>Products</h1>
        {
          data!==null? <div>{
            data.map((product)=>(
              <ProductCard key={product._id} {...product}/>
            ))
            }</div>: <p>No data available</p>
        }
      </div>
      
    </div>
  )
}

export default Products
