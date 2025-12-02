'use client'
import React from 'react'

const OrderQuantity = ({ quantity }) => {
    const { orderQuantity, setOrderQuantity } = quantity

    const decrease = () => {
        if (orderQuantity <= 1) {
            setOrderQuantity(1)
        } else {
            setOrderQuantity(orderQuantity - 1)
        }
    }
    return (
        <div className=' flex flex-row items-center justify-center gap-6'>
            <button onClick={decrease} className='px-4 rounded-full cursor-pointer bg-slate-100'>-</button>
            <p>{orderQuantity}</p>
            <button onClick={() => { setOrderQuantity(orderQuantity + 1) }} className='px-4 cursor-pointer rounded-full bg-slate-100'>+</button>
        </div>
    )
}

export default OrderQuantity
