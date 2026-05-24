'use client'
import React, { useContext, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Context } from '../helper/Context'
import axios from 'axios'
import BarScanner from '../helper/BarcodeScanner'

const AddProductForm = () => {
    const { setIsCategoryBox, setIsBrandBox, categories, brands } = useContext(Context)

    const [formData, setFormData] = useState({
        name: '',
        barcode: '',
        categoryId: '',
        subCategoryId: '',
        brandId: '',
        unit: '',
        stock: '',
        purchasePrice: '',
        salePrice: '',
        discountPrice: '',
        wholeSalePrice: '',
        retailPrice: '',
        dealerPrice: '',
        description: '',
        image: null,
    })

    const [variants, setVariants] = useState([])

    const addVariantRow = () => setVariants(prev => [...prev, { variant_name: '', price: '', stock: '' }])
    const removeVariantRow = (i) => setVariants(prev => prev.filter((_, idx) => idx !== i))
    const updateVariant = (i, field, value) => setVariants(prev => prev.map((v, idx) => idx === i ? { ...v, [field]: value } : v))



    const handleChange = (e) => {
        const { name, value, files } = e.target
        if (files) {
            setFormData({ ...formData, image: files[0] })
        } else {
            setFormData({ ...formData, [name]: value })
        }
    }

    const mainCategories = categories?.filter(cat => !cat.parent_id) || [];
    const subCategories = categories?.filter(cat => cat.parent_id && cat.parent_id === parseInt(formData.categoryId)) || [];

    const handleAddBarcode = (code) => {
        setFormData(prev => ({ ...prev, barcode: code }))
        toast(`Barcode Scanned: ${code}`, { duration: 2000, icon: '🏷️' })
    }


    const SubmitNewProduct = async (e) => {
        e.preventDefault()
        try {
            const newData = new FormData()
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== '') {
                    newData.append(key, formData[key])
                }
            })
            if (variants.length > 0) {
                newData.append('variants', JSON.stringify(variants))
            }



            const response = await axios.post('/api/product', newData, { withCredentials: true })
            toast.success(response.data.message)

            setFormData({
                name: '', barcode: '', categoryId: '', brandId: '', unit: '',
                stock: '', purchasePrice: '', salePrice: '', discountPrice: '',
                wholeSalePrice: '', retailPrice: '', dealerPrice: '',
                description: '', image: null,
            })
            setVariants([])

        } catch (error) {
            console.error(error)
            toast.error(error?.response?.data?.message || "Failed to add product")
        }
    }

    return (
        <div className='w-full max-w-4xl mx-auto bg-white p-8 rounded-2xl border border-slate-100 shadow-sm'>
            <div className='mb-8 text-center'>
                <h1 className='text-2xl font-bold text-slate-800 tracking-tight'>Add New Product</h1>
                <p className='text-slate-400 text-sm mt-1'>Fill in the details to expand your inventory</p>
            </div>

            <div className='mb-8'>
                <BarScanner onScan={handleAddBarcode} />
            </div>

            <form onSubmit={SubmitNewProduct} className='flex flex-col gap-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='flex flex-col gap-1.5'>
                        <label htmlFor="name" className='text-xs font-bold text-slate-500 uppercase tracking-wider ml-1'>Product Name *</label>
                        <input type="text" name='name' id='name' required value={formData.name} onChange={handleChange} className='w-full border border-slate-200 bg-slate-50/30 px-4 py-2.5 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-sm' placeholder='e.g. Premium Cotton Shirt' />
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label htmlFor="barcode" className='text-xs font-bold text-slate-500 uppercase tracking-wider ml-1'>Barcode / SKU</label>
                        <input
                            type="text"
                            name='barcode'
                            id='barcode'
                            placeholder="Scan or leave empty for auto-gen"
                            value={formData.barcode}
                            onChange={handleChange}
                            className='w-full border border-slate-200 bg-slate-50/50 font-mono px-4 py-2.5 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-sm'
                        />
                        <div className='flex items-center gap-1.5 ml-1 mt-1'>
                            {formData.barcode ? 
                                <span className='text-[10px] text-emerald-600 font-bold flex items-center gap-1'>✓ Manual Code</span> : 
                                <span className='text-[10px] text-amber-500 font-bold flex items-center gap-1'>⚡ Auto-generate on save</span>
                            }
                        </div>
                    </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='flex items-end gap-2'>
                        <div className='flex-1 flex flex-col gap-1.5'>
                            <label htmlFor="categoryId" className='text-xs font-bold text-slate-500 uppercase tracking-wider ml-1'>Category *</label>
                            <select 
                                name='categoryId' 
                                id='categoryId' 
                                required 
                                value={formData.categoryId} 
                                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} 
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
                        <button type='button' className='h-[42px] px-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-primary hover:text-white transition-all text-xs' onClick={() => setIsCategoryBox(true)}>Add</button>
                    </div>

                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    <div className='flex items-end gap-2'>
                        <div className='flex-1 flex flex-col gap-1.5'>
                            <label htmlFor="brandId" className='text-xs font-bold text-slate-500 uppercase tracking-wider ml-1'>Brand</label>
                            <select name='brandId' id='brandId' value={formData.brandId} onChange={handleChange} className='w-full border border-slate-200 bg-slate-50/30 px-4 py-2.5 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-sm appearance-none'>
                                <option value="">Select Brand</option>
                                {brands.map((brand) => (
                                    <option value={brand.brand_id} key={brand.brand_id}>{brand.name}</option>
                                ))}
                            </select>
                        </div>
                        <button type='button' className='h-[42px] px-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-primary hover:text-white transition-all text-xs' onClick={() => setIsBrandBox(true)}>Add</button>
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <label htmlFor="unit" className='text-xs font-bold text-slate-500 uppercase tracking-wider ml-1'>Unit *</label>
                        <input type="text" name='unit' id='unit' required value={formData.unit} onChange={handleChange} className='w-full border border-slate-200 bg-slate-50/30 px-4 py-2.5 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-sm' placeholder='e.g. Pcs, Kg, Pkt' />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <label htmlFor="stock" className='text-xs font-bold text-slate-500 uppercase tracking-wider ml-1'>Initial Stock *</label>
                        <input type="number" min={0} step="0.01" name='stock' id='stock' required value={formData.stock} onChange={handleChange} className='w-full border border-slate-200 bg-slate-50/30 px-4 py-2.5 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-sm' placeholder='0.00' />
                    </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                    <div className='flex flex-col gap-1.5'>
                        <label htmlFor="purchasePrice" className='text-xs font-bold text-slate-500 uppercase tracking-wider ml-1'>Purchase Price *</label>
                        <div className='relative'>
                            <span className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold'>৳</span>
                            <input type="number" min={0} step="0.01" name='purchasePrice' id='purchasePrice' required value={formData.purchasePrice} onChange={handleChange} className='w-full border border-slate-200 bg-slate-50/30 pl-8 pr-4 py-2.5 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-sm font-bold text-slate-700' />
                        </div>
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <label htmlFor="salePrice" className='text-xs font-bold text-slate-500 uppercase tracking-wider ml-1'>Regular Sale Price *</label>
                        <div className='relative'>
                            <span className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold'>৳</span>
                            <input type="number" min={0} step="0.01" name='salePrice' id='salePrice' required value={formData.salePrice} onChange={handleChange} className='w-full border border-slate-200 bg-slate-50/30 pl-8 pr-4 py-2.5 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-sm font-bold text-slate-700' />
                        </div>
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <label htmlFor="discountPrice" className='text-xs font-bold text-slate-500 uppercase tracking-wider ml-1'>Offer Price (Optional)</label>
                        <div className='relative'>
                            <span className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold'>৳</span>
                            <input type="number" min={0} step="0.01" name='discountPrice' id='discountPrice' value={formData.discountPrice} onChange={handleChange} className='w-full border border-slate-200 bg-slate-50/30 pl-8 pr-4 py-2.5 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-sm font-bold text-rose-600' />
                        </div>
                    </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                    <div className='flex flex-col gap-1.5'>
                        <label htmlFor="retailPrice" className='text-xs font-bold text-slate-500 uppercase tracking-wider ml-1'>Retail Price</label>
                        <input type="number" min={0} step="0.01" name='retailPrice' id='retailPrice' value={formData.retailPrice} onChange={handleChange} className='w-full border border-slate-200 bg-slate-50/30 px-4 py-2.5 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-sm' />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <label htmlFor="wholeSalePrice" className='text-xs font-bold text-slate-500 uppercase tracking-wider ml-1'>Wholesale Price *</label>
                        <input type="number" min={0} step="0.01" name='wholeSalePrice' id='wholeSalePrice' required value={formData.wholeSalePrice} onChange={handleChange} className='w-full border border-slate-200 bg-slate-50/30 px-4 py-2.5 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-sm font-bold text-slate-700' />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <label htmlFor="dealerPrice" className='text-xs font-bold text-slate-500 uppercase tracking-wider ml-1'>Dealer Price</label>
                        <input type="number" min={0} step="0.01" name='dealerPrice' id='dealerPrice' value={formData.dealerPrice} onChange={handleChange} className='w-full border border-slate-200 bg-slate-50/30 px-4 py-2.5 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-sm' />
                    </div>
                </div>

                <div className='flex flex-col gap-1.5'>
                    <label htmlFor="description" className='text-xs font-bold text-slate-500 uppercase tracking-wider ml-1'>Product Description *</label>
                    <textarea name="description" id="description" required value={formData.description} onChange={handleChange} className='w-full border border-slate-200 bg-slate-50/30 px-4 py-3 rounded-xl outline-none focus:border-primary focus:bg-white transition-all text-sm h-32 resize-none' placeholder='Write details about the product...'></textarea>
                </div>

                <div className='flex flex-col gap-1.5'>
                    <label htmlFor="image" className='text-xs font-bold text-slate-500 uppercase tracking-wider ml-1'>Product Image *</label>
                    <div className='w-full border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50/30 hover:bg-slate-50 transition-all'>
                        <input type="file" name='image' id='image' accept='image/*' required onChange={handleChange} className='w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary file:text-white hover:file:bg-primary-dark transition-all cursor-pointer' />
                    </div>
                </div>

                {/* Product Variants */}
                <div className='flex flex-col gap-3 border border-slate-100 rounded-2xl p-5 bg-slate-50/40'>
                    <div className='flex items-center justify-between'>
                        <label className='text-xs font-bold text-slate-500 uppercase tracking-wider'>Product Variants <span className='text-slate-300 font-normal normal-case'>(Size / Colour)</span></label>
                        <button type='button' onClick={addVariantRow} className='px-3 py-1.5 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-primary hover:text-white transition-all text-xs'>+ Add Variant</button>
                    </div>
                    {variants.length === 0 && (
                        <p className='text-xs text-slate-400'>No variants added. Click &quot;+ Add Variant&quot; to add sizes or colours with individual prices.</p>
                    )}
                    {variants.length > 0 && (
                        <div className='flex flex-col gap-2'>
                            <div className='grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1'>
                                <span className='col-span-5'>Variant Name</span>
                                <span className='col-span-3'>Price (৳)</span>
                                <span className='col-span-3'>Stock</span>
                                <span className='col-span-1'></span>
                            </div>
                            {variants.map((v, i) => (
                                <div key={i} className='grid grid-cols-12 gap-2 items-center'>
                                    <input
                                        className='col-span-5 border border-slate-200 bg-white px-3 py-2 rounded-lg outline-none focus:border-primary text-sm'
                                        placeholder='e.g. Red - XL'
                                        value={v.variant_name}
                                        onChange={e => updateVariant(i, 'variant_name', e.target.value)}
                                    />
                                    <input
                                        type='number' min='0' step='0.01'
                                        className='col-span-3 border border-slate-200 bg-white px-3 py-2 rounded-lg outline-none focus:border-primary text-sm'
                                        placeholder='0.00'
                                        value={v.price}
                                        onChange={e => updateVariant(i, 'price', e.target.value)}
                                    />
                                    <input
                                        type='number' min='0'
                                        className='col-span-3 border border-slate-200 bg-white px-3 py-2 rounded-lg outline-none focus:border-primary text-sm'
                                        placeholder='0'
                                        value={v.stock}
                                        onChange={e => updateVariant(i, 'stock', e.target.value)}
                                    />
                                    <button type='button' onClick={() => removeVariantRow(i)} className='col-span-1 text-rose-400 hover:text-rose-600 font-bold text-xl leading-none transition-colors text-center'>×</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className='pt-6 border-t border-slate-100 flex justify-center'>
                    <button className='w-full md:w-auto px-12 py-3.5 rounded-xl bg-primary text-white font-bold cursor-pointer hover:bg-primary-dark transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2' type='submit'>
                        Save Product
                    </button>
                </div>
            </form>
        </div>
    )
}

export default AddProductForm
