'use client'
import AddToCart from '@/components/Button/AddToCart'
import OrderQuantity from '@/components/cards/OrderQuantity'
import ProductCard from '@/components/cards/ProductCard'
import axios from 'axios'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const Product = () => {
  const { slug } = useParams()
  const [orderQuantity, setOrderQuantity]= useState(1)
  const [data, setData] = useState(null)
  const [cateData, setCateData] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/products/${slug}`, {
          withCredentials: true
        })
        setData(response.data.payload)
      } catch (error) {
        console.log(error)
      }
    }

    if (slug) fetchData()
  }, [slug])

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await axios.get(`/api/products/category/${data.category}`, {
          withCredentials: true
        })
        setCateData(response.data.payload)
      } catch (error) {
        console.log(error)
      }
    }

    if (data?.category) fetchCategory()
  }, [data?.category])

  if (!data) return <p>No data found</p>

  return (
    <div className='w-full min-h-screen flex flex-col items-center px-2 py-6 gap-4'>
      <h1>Product Overview</h1>

      <div className='flex flex-col items-center gap-4 w-1/2'>
        <h1 className='text-2xl font-semibold text-center'>{data.title}</h1>

        <Image
          src={data.image}
          alt={data.title}
          width={1000}
          height={1000}
          className='w-full h-[400px] border-2 border-black/10 object-cover'
        />

        <div className='w-full flex flex-row items-start justify-between'>
          <p className='line-through italic text-red-300'>Old price: {data.oldPrice || 999}</p>
          <div className='flex flex-row gap-1'>
            <span>Price:</span>
            <span className='text-xs'>BDT</span>
            <span>{data.price}</span>
            <span>/ {data.unit}</span>
          </div>
          <OrderQuantity quantity={{orderQuantity, setOrderQuantity}}/>
          <AddToCart id={data._id} />
        </div>
        <p>{data.description}</p>



        {cateData && (
          <div className='w-full flex flex-col items-center justify-center gap-8'>
            <h1 className='text-3xl font-semibold'>You Might Also Like</h1>
            <div className='w-full grid grid-cols-2 sm:grid-cols-3 gap-2 p-2'>

              {cateData.map((product) => (
                <ProductCard key={product._id} {...product} />
              ))}
            </div>
          </div>

        )}
      </div>
    </div>
  )
}

export default Product
