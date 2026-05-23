'use client'
import React, { useContext, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Context } from '../helper/Context'
import axios from 'axios'

const UpdateProductForm = ({ product }) => {
    const { categories, brands } = useContext(Context)
    const [imageFile, setImageFile] = useState(null)
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        productId: product?.product_id,
        name: product?.name || '',
        category_id: product?.category_id || '',
        brand_id: product?.brand_id || '',
        barcode: product?.barcode || '',
        unit: product?.unit || '',
        stock: product?.stock || '',
        purchase_price: product?.purchase_price || '',
        sale_price: product?.sale_price || '',
        discount_price: product?.discount_price || '',
        wholesale_price: product?.wholesale_price || '',
        retail_price: product?.retail_price || '',
        dealer_price: product?.dealer_price || '',
        description: product?.description || '',
    })



    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    // Filter categories
    const mainCategories = categories?.filter(cat => !cat.parent_id) || [];
    const subCategories = categories?.filter(cat => cat.parent_id && cat.parent_id === parseInt(formData.category_id)) || [];


    const SubmitUpdateProduct = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const data = new FormData()
            data.append("id", formData.productId)
            data.append("name", formData.name)
            data.append("category_id", formData.category_id)
            data.append("brand_id", formData.brand_id)
            data.append("barcode", formData.barcode)
            data.append("unit", formData.unit)
            data.append("stock", formData.stock)
            data.append("purchase_price", formData.purchase_price)
            data.append("sale_price", formData.sale_price)
            data.append("discount_price", formData.discount_price)
            data.append("wholesale_price", formData.wholesale_price)
            data.append("retail_price", formData.retail_price)
            data.append("dealer_price", formData.dealer_price)
            data.append("description", formData.description)

            if (imageFile) {
                data.append("image", imageFile)
            }



            const response = await axios.put('/api/product', data, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" }
            })

            toast.success(response.data.message)
        } catch (error) {
            console.error(error)
            toast.error(error?.response?.data?.message || "Failed to update product")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='w-full max-w-4xl mx-auto bg-white p-8 rounded-2xl border border-slate-100 shadow-sm'>
            <h1 className='text-center text-2xl font-bold text-slate-800 mb-6'>Update Product</h1>
            <form onSubmit={SubmitUpdateProduct} className='flex flex-col gap-6'>

                {/* Image Upload Input */}
                <div className='w-full flex flex-col gap-1.5'>
                    <label className='text-xs font-bold text-slate-500 uppercase tracking-wider ml-1'>Product Image (Leave blank to keep current)</label>
                    <div className='w-full border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50/30 hover:bg-slate-50 transition-all'>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files[0])}
                            className='w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary file:text-white hover:file:bg-primary-dark transition-all cursor-pointer'
                        />
                    </div>
                    {product?.image && <p className='text-[10px] text-slate-400 mt-1 ml-1 font-mono truncate'>Current: {product.image}</p>}
                </div>

                <div className='flex flex-col gap-1.5'>
                    <label htmlFor="name" className='text-xs font-bold text-slate-500 uppercase tracking-wider ml-1'>Name *</label>
                    <input type="text" name='name' id='name' required value={formData.name} onChange={handleChange} className='w-full border border-slate-200 bg-slate-50/30 px-4 py-2.5 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-sm' />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='flex flex-col gap-1.5'>
                        <label htmlFor="category_id" className='text-xs font-bold text-slate-500 uppercase tracking-wider ml-1'>Category *</label>
                        <select 
                            name='category_id' 
                            id='category_id' 
                            required 
                            value={formData.category_id} 
                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} 
                            className='w-full border border-slate-200 bg-slate-50/30 px-4 py-2.5 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-sm appearance-none'
                        >
                            <option value="">Select Category</option>
                            {categories.map((cat) => {
                                const isSub = !!cat.parent_id;
                                return (
                                    <option value={cat.category_id} key={cat.category_id}>
                                        {isSub ? `↳ ${cat.name}` : cat.name}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <label htmlFor="brand_id" className='text-xs font-bold text-slate-500 uppercase tracking-wider ml-1'>Brand</label>
                        <select name='brand_id' id='brand_id' value={formData.brand_id} onChange={handleChange} className='w-full border border-slate-200 bg-slate-50/30 px-4 py-2.5 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-sm appearance-none'>
                            <option value="">Select Brand</option>
                            {brands.map((brand) => (
                                <option value={brand.brand_id} key={brand.brand_id}>{brand.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='flex flex-col gap-1.5'>
                        <label htmlFor="unit" className='text-xs font-bold text-slate-500 uppercase tracking-wider ml-1'>Unit *</label>
                        <input type="text" name='unit' id='unit' required value={formData.unit} onChange={handleChange} className='w-full border border-slate-200 bg-slate-50/30 px-4 py-2.5 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-sm' />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <label htmlFor="barcode" className='text-xs font-bold text-slate-500 uppercase tracking-wider ml-1'>Barcode *</label>
                        <input type="text" name='barcode' id='barcode' required value={formData.barcode} onChange={handleChange} className='w-full border border-slate-200 bg-slate-50/30 px-4 py-2.5 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-sm' />
                    </div>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='flex flex-col gap-1.5'>
                        <label htmlFor="stock" className='text-xs font-bold text-slate-500 uppercase tracking-wider ml-1'>Stock *</label>
                        <input type="number" step="0.01" name='stock' id='stock' required value={formData.stock} onChange={handleChange} className='w-full border border-slate-200 bg-slate-50/30 px-4 py-2.5 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-sm' />
                    </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='flex flex-col gap-1.5'>
                        <label htmlFor="purchase_price" className='text-xs font-bold text-slate-500 uppercase tracking-wider ml-1'>Purchase Price *</label>
                        <input type="number" step="0.01" name='purchase_price' id='purchase_price' required value={formData.purchase_price} onChange={handleChange} className='w-full border border-slate-200 bg-slate-50/30 px-4 py-2.5 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-sm font-bold text-slate-700' />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <label htmlFor="sale_price" className='text-xs font-bold text-slate-500 uppercase tracking-wider ml-1'>Sale Price *</label>
                        <input type="number" step="0.01" name='sale_price' id='sale_price' required value={formData.sale_price} onChange={handleChange} className='w-full border border-slate-200 bg-slate-50/30 px-4 py-2.5 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-sm font-bold text-slate-700' />
                    </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                    <div className='flex flex-col gap-1.5'>
                        <label htmlFor="sale_price" className='text-xs font-bold text-slate-500 uppercase tracking-wider ml-1'>Sale Price *</label>
                        <input type="number" step="0.01" name='sale_price' id='sale_price' required value={formData.sale_price} onChange={handleChange} className='w-full border border-slate-200 bg-slate-50/30 px-4 py-2.5 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-sm font-bold text-slate-700' />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <label htmlFor="discount_price" className='text-xs font-bold text-slate-500 uppercase tracking-wider ml-1'>Discount Price</label>
                        <input type="number" step="0.01" name='discount_price' id='discount_price' value={formData.discount_price} onChange={handleChange} className='w-full border border-slate-200 bg-slate-50/30 px-4 py-2.5 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-sm text-rose-600 font-bold' />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <label htmlFor="wholesale_price" className='text-xs font-bold text-slate-500 uppercase tracking-wider ml-1'>Wholesale Price *</label>
                        <input type="number" step="0.01" name='wholesale_price' id='wholesale_price' required value={formData.wholesale_price} onChange={handleChange} className='w-full border border-slate-200 bg-slate-50/30 px-4 py-2.5 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-sm font-bold text-slate-700' />
                    </div>
                </div>

                <div className='flex flex-col gap-1.5'>
                    <label htmlFor="description" className='text-xs font-bold text-slate-500 uppercase tracking-wider ml-1'>Description *</label>
                    <textarea name="description" id="description" required value={formData.description} onChange={handleChange} className='w-full border border-slate-200 bg-slate-50/30 px-4 py-3 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-sm h-32 resize-none'></textarea>
                </div>



                <div className='pt-6 border-t border-slate-100 flex justify-center'>
                    <button
                        disabled={loading}
                        className='w-full md:w-auto px-12 py-3.5 rounded-xl bg-primary text-white font-bold cursor-pointer hover:bg-primary-dark disabled:bg-slate-300 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2'
                        type='submit'
                    >
                        {loading ? "Updating..." : "Update Product"}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default UpdateProductForm
