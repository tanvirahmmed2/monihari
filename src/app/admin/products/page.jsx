import DeletedProduct from '@/components/Button/DeletedProduct';
import AddProduct from '@/components/cards/AddProduct'
import Link from 'next/link';
import React from 'react'

const Products = async () => {

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
        <AddProduct />
      </div>

      <div className='w-full flex flex-col items-center justify-center gap-4'>
        <h1 className='text-xl font-semibold text-center'>Products</h1>
        {
          data !== null ? <div className='w-full flex flex-col items-center justify-center gap-4'>{
            data.map((product) => (
              <div key={product._id} className='w-full lg:w-1/2 flex flex-row items-center justify-between bg-gray-200 gap-6 p-4'>
                <Link href={`/products/${product.slug}`} className='w-full'>{product.title}</Link>
                <p className='px-8 flex flex-row items-center justify-center'><span className='text-[10px] italic'>BDT</span>  {product.price}</p>
                <div className=' flex flex-col gap-2  items-end'>
                
                    <Link className='cursor-pointer bg-slate-300 p-1 px-4 rounded-lg' href={`/admin/products/${product.slug}`}>Update</Link>
                    <DeletedProduct id={product._id} />

                </div>
              </div>
            ))
          }</div> : <p>No data available</p>
        }
      </div>

    </div>
  )
}

export default Products
