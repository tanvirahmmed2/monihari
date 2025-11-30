import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const ProductCard = ({ _id, title, slug, price, image }) => {
  return (
    <div className='w-full rounded-lg flex flex-col items-center justify-center p-1 border-2 border-black/10'>
      <Image src={image} alt={slug} width={200} height={200} />
      <h1>{title.slice(0,28)}..</h1>
      <div className='flex flex-row items-center justify-between w-full'>
        <p>Price: {price}</p>
        <Link href={`/products/${slug}`} className='bg-black text-white px-2 rounded-lg'>View</Link>
      </div>
    </div>
  )
}

export default ProductCard
