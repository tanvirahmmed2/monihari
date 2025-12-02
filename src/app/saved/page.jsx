'use client'

import RemoveFromSave from "@/components/Button/RemoveFromSave"
import axios from "axios"
import Link from "next/link"
import { useEffect, useState } from "react"

const Saved = () => {
  const [data, setData] = useState(null)

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
          <div className="w-full flex flex-row items-center justify-between gap-6 bg-slate-200 p-2">
                <p className="w-full">Title</p>
                <p>Quantity</p>
                <p>Price</p>
                <p>Action</p>
              </div>
          {
            data.map((product) => (
              <div key={product.productId} className="w-full flex flex-row items-center justify-between gap-6 bg-slate-200 p-2">
                <p className="w-full">{product.title}</p>
                <p>{product.quantity}</p>
                <p>{product.price}</p>
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
