'use client'
import axios from 'axios'
import React from 'react'

const SaveProduct = (props) => {

  const { productId } = props

  const saveProduct = async () => {
    const data = { productId }
    try {
      const response = await axios.post('/api/user/addtosave', data, { withCredentials: true })
      alert(response.data.message)
    } catch (error) {
      console.log(error)
      alert(error?.response?.data?.message)

    }
  }
  return (
    <button onClick={saveProduct} className='px-2 p-2 bg-emerald-500 text-white rounded-lg hover:opacity-80 text-xs cursor-pointer w-full'>Save</button>
  )
}

export default SaveProduct
