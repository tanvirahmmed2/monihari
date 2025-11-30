import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import AddToCart from '../Button/AddToCart'

const ProductCard = ({ _id, title, slug, price, image }) => {
  return (
    <div className='w-full rounded-lg flex flex-col items-center justify-between p-1 border-2 border-black/10'>
      <Image src={image} alt={slug} width={200} height={200} className='w-full h-[200px] object-cover' />
      <Link  href={`/products/${slug}`} className=' w-full'>{title}</Link>
      <div className='w-full flex flex-row items-center justify-between'>
        <p><span className='text-[10px] italic'>BDT</span> <span className='text-2xl font-semibold'>{price}</span></p>
        <AddToCart />
      </div>
    </div>
  )
}

export default ProductCard
