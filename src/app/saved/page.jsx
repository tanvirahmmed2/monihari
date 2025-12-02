'use client'

import AddToCart from "@/components/Button/AddToCart"
import RemoveFromSave from "@/components/Button/RemoveFromSave"
import OrderQuantity from "@/components/cards/OrderQuantity"
import axios from "axios"
import Link from "next/link"
import { useEffect, useState } from "react"

const Saved = () => {
  const [data, setData] = useState(null)
  
    const [orderQuantity, setOrderQuantity] = useState(1)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/profile', { withCredentials: true })
        const user = response.data.payload
        setData(user.saved)
      } catch (error) {
        console.log(error)
      }
    }
    fetchData()
  }, [])


  return (
    <div className="w-full min-h-screen flex items-center gap-4 flex-col p-2">
      {
        data !== null ? <div className='w-full md:w-1/2 flex flex-col items-center min-h-screen gap-6 bg-slate-50 p-4'>
          <h1 className="text-2xl font-semibold">View Cart Item</h1>
          <div className="w-full grid grid-cols-5 gap-6 bg-slate-200 p-2">
                <p className="w-full">Title</p>
                <p>Price</p>
                <p>Quantity</p>
                <p>Add to cart</p>
                <p>Action</p>
              </div>
          {
            data.map((product) => (
              <div key={product.productId} className="w-full grid grid-cols-5 gap-6 bg-slate-200 p-2">
                <Link href={`/products/${product.slug}`} >{product.title}</Link>
                <p>{product.price}</p>
                <OrderQuantity quantity={{ orderQuantity, setOrderQuantity }}/>
                <AddToCart productId={data._id} quantity={orderQuantity}/>
                <RemoveFromSave productId={product.productId}/>
              </div>
            ))
          }
        </div> : <div className='w-full md:w-3/4 flex flex-col items-center justify-center min-h-screen text-center'>
          <p>No saved  data found</p>
          <Link href='/products' className="text-2xl">Visit latest products</Link>
        </div>
      }
    </div>
  )
}

export default Saved
