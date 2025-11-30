import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const ProductCard = ({ _id, title, slug, price, image }) => {
  return (
    <Link href={`/products/${slug}`} className='w-full rounded-lg flex flex-col items-center justify-center p-1 border-2 border-black/10'>
      <Image src={image} alt={slug} width={200} height={200} />
      <h1>{title.slice(0,28)}..</h1>
      <p>Price: {price}</p>
    </Link>
  )
}

export default ProductCard
