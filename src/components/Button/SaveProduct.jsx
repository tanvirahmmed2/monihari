'use client'
import React from 'react'

const SaveProduct = (props) => {

    const {id}=props

    const saveProduct=()=>{
        alert( id)
    }
  return (
    <button onClick={saveProduct} className='px-2 p-2 bg-emerald-500 text-white rounded-lg hover:opacity-80 text-xs cursor-pointer w-full'>Save</button>
  )
}

export default SaveProduct
