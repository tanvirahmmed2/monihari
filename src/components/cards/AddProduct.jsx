'use client'
import React, { useState } from 'react'
import axios from 'axios'

const AddProduct = () => {
    const [data, setData] = useState({
        title: '',
        category: '',
        description: '',
        price: '',
        wholeSalePrice: '',
        quantity: '',
        image: ''

    })

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (files) {
            setData({ ...data, image: files[0] });
        } else {
            setData({ ...data, [name]: value });
        }

    }

    const handleAddProduct = async (e) => {
        e.preventDefault()
        try {
            const formData = new FormData();

            for (let key in data) {
                formData.append(key, data[key]);
            }

            const response = await axios.post('/api/products', formData, { withCredentials: true })
            alert(response.data.message)
        } catch (error) {
            console.log(error)

        }

    }


    return (
        <form onSubmit={handleAddProduct} className='w-1/2 flex flex-col items-center justify-center gap-4'>
            <div className='w-full flex flex-col gap-2'>
                <label htmlFor="title">Title</label>
                <input type="text" id='title' name='title' required onChange={handleChange} value={data.title} className='px-2 p-1 border-2 rounded-lg outline-none border-black/15' />
            </div>
            <div className='w-full flex flex-col gap-2'>
                <label htmlFor="category">Category</label>
                <select name="category" id="category" required value={data.category} onChange={handleChange} className='px-2 p-1 border-2 rounded-lg outline-none border-black/15' >
                    <option value="">--select an option--</option>
                    <option value="rice&grains">Rice & Grains</option>
                    <option value="frozenfood">Frozen Food</option>
                    <option value="oil&ghee">Oil & Ghee</option>
                    <option value="masala">Masala</option>
                    <option value="snacks">Snacks</option>
                    <option value="healthcare">Health Care</option>
                    <option value="cleaning&household">Cleaning and Household</option>
                </select>
            </div>
            <div className='w-full flex flex-col gap-2'>
                <label htmlFor="description">Description</label>
                <input type="text" id='description' name='description' required value={data.description} onChange={handleChange} className='px-2 p-1 border-2 rounded-lg outline-none border-black/15' />
            </div>
            <div className='w-full flex flex-col gap-2'>
                <label htmlFor="price">Price</label>
                <input type="number" id='price' name='price' required value={data.price} onChange={handleChange} className='px-2 p-1 border-2 rounded-lg outline-none border-black/15' />
            </div>
            <div className='w-full flex flex-col gap-2'>
                <label htmlFor="wholeSalePrice">WholeSale Price</label>
                <input type="number" id='wholeSalePrice' name='wholeSalePrice' required value={data.wholeSalePrice} onChange={handleChange} className='px-2 p-1 border-2 rounded-lg outline-none border-black/15' />
            </div>
            <div className='w-full flex flex-col gap-2'>
                <label htmlFor="quantity">Quantity</label>
                <input type="number" id='quantitye' name='quantity' min={1} required value={data.quantity} onChange={handleChange} className='px-2 p-1 border-2 rounded-lg outline-none border-black/15' />
            </div>
            <div className='w-full flex flex-col gap-2'>
                <label htmlFor="image">Image</label>
                <input type="file" id='image' name='image' accept='image/*' className='px-2 p-1 border-2 rounded-lg outline-none border-black/15' />
            </div>
            <button type='submit' className='p-1 bg-black text-white rounded-3xl w-full cursor-pointer'>Submit</button>
        </form>
    )
}

export default AddProduct
