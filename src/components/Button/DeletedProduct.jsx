'use client'
import axios from 'axios'
import React from 'react'

const DeletedProduct = ({id}) => {

    const deleteProduct= async () => {
        try {
           const response= await axios.delete("/api/products/", {data:{id}, withCredentials: true})
           alert(response.data.message)
        } catch (error) {
            console.log(error)
            alert('Failed to delete product')
        }
        
    }

  return (
    <button onClick={deleteProduct} className='cursor-pointer bg-slate-300 p-1 px-5 rounded-lg'>Delete</button>
  )
}

export default DeletedProduct
