'use client'
import AddToCart from '@/components/Button/AddToCart'
import SaveProduct from '@/components/Button/SaveProduct'
import OrderQuantity from '@/components/cards/OrderQuantity'
import ProductCard from '@/components/cards/ProductCard'
import axios from 'axios'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const Product = () => {
  const { slug } = useParams()
  const [orderQuantity, setOrderQuantity] = useState(1)
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

  if (!data) return <div className='w-full min-h-screen flex items-center justify-center'>
    <p>No data found</p>
  </div>

  return (
    <div className='w-full min-h-screen flex flex-col items-center px-2 py-6 gap-4'>
      <h1>{data.title} - Overview</h1>

      <div className='flex flex-col items-center gap-4 w-full md:w-3/4 mt-8'>

        <div className='w-full flex flex-col md:flex-row items-center justify-center md:items-start gap-6 md:gap-10'>
          <div className='w-full flex items-center justify-center'>
            <Image
              src={data.image}
              alt={data.title}
              width={1000}
              height={1000}
              className='w-full h-[400px]  sm:h-[500px] border-2 border-black/10 object-cover rounded-xl'
            />
          </div>


          <div className='w-full flex flex-col gap-4'>
            <h1 className='text-2xl font-semibold text-center'>{data.title}</h1>
            {data.stock ? <div className='w-full flex flex-row items-center justify-between'>
              <p>Stock: Available</p>
              <p>In stock: {data.quantity}</p>
            </div> : <p>Unavailable</p>}
            <p className='line-through text-xs text-red-300'>Old price: {data.oldPrice || 999}</p>
            <div className='flex flex-row gap-1 w-full items-center justify-between'>
              <p>Price: BDT {data.price}</p>
              <span>Weight: {data.unit}</span>
            </div>
            <OrderQuantity quantity={{ orderQuantity, setOrderQuantity }} />
            <div className='w-full flex flex-row items-center justify-between gap-2'>
              <SaveProduct id={data._id}/>
              <AddToCart id={data._id} quantity={orderQuantity} />
            </div>

            <p>{data.description}</p>

          </div>

        </div>

        {cateData && (
          <div className='w-full flex flex-col items-center justify-center gap-8 mt-10'>
            <h1 className='text-3xl'>You Might Also Like</h1>
            <div className='w-full grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 p-2'>

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
