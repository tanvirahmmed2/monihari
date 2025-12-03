import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const ProductCard = ({ _id, title, slug, price, image, unit }) => {
  const imgSrc = image || '/fallback.jpeg'; 

  return (
    <Link
      href={`/products/${slug}`}
      className="w-full rounded-lg flex flex-col items-center justify-between p-1 border-2 border-black/10 gap-2 relative group"
    >
      <Image
        src={imgSrc}
        alt={slug || title}
        width={200}
        height={200}
        className="w-full h-[250px] object-cover rounded-lg"
      />
      <div className='w-full flex flex-col items-center justify-center gap-2 absolute bottom-0 p-2 bg-white '>
        <p className=" text-sm hidden group-hover:block">BDT {price}</p>
        <h1 className="font-semibold text-sm">{title}</h1>
      </div>
    </Link>
  )
}

export default ProductCard
