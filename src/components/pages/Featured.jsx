import React from 'react'
import ProductCard from '../cards/ProductCard'

const Featured = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products/featured`, {
        method: 'GET',
        cache: 'no-store',
        credentials: 'include'
    })

    const data = await res.json()
    const products = data.payload
    return (
        <div className='w-full flex flex-col items-center justify-center p-2 gap-4'>
            {
                products && <div className='w-full flex flex-col items-center justify-center p-2 gap-4'>
                    <h1 className='text-3xl text-center'>Featured Products</h1>
                    <div className='w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 p-2'>
                        {
                            products.map((product) => (
                                <ProductCard key={product.slug} {...product} />
                            ))
                        }
                    </div>
                </div>
            }

        </div>
    )
}

export default Featured
