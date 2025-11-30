'use client'
import React from 'react'

const OrderQuantity = ({ quantity }) => {
    const { orderQuantity, setOrderQuantity } = quantity

    const decrease=()=>{
        if(orderQuantity<=1){
            setOrderQuantity(1)
        }else{
            setOrderQuantity(orderQuantity -1)
        }
    }
    return (
        <div className='flex flex-row gap-4'>
            <p>Quantity</p>
            <div className=' flex flex-row items-center justify-center gap-2'>
                <button onClick={decrease} className='px-4 text-white rounded-full bg-gray-600'>-</button>
                <p>{orderQuantity}</p>
                <button onClick={() => { setOrderQuantity(orderQuantity + 1) }} className='px-4 text-white rounded-full bg-gray-600'>+</button>
            </div>
        </div>
    )
}

export default OrderQuantity
