'use client'
import axios from 'axios'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const Product = () => {
  const { slug } = useParams()
  const [data, setData] = useState(null)

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

  return (
    <div>
      <h1>Product</h1>

      {data ? (
        <p>{data.description}</p>
      ) : (
        <p>Data not found</p>
      )}
    </div>
  )
}

export default Product
