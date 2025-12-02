'use client'
import React from 'react'
import { MdDeleteOutline } from "react-icons/md";

const RemoveFromCart = ({productId}) => {
  return (
    <MdDeleteOutline onClick={()=>{alert(productId)}}  className='text-2xl cursor-pointer'/>
  )
}

export default RemoveFromCart
