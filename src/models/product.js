import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    image: {
        type: String,
        required: true,
        trim: true
    },
    imageId: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: true,
    },
    wholeSalePrice: {
        type: Number,
    },
    discount: {
        type: Number,
        default: null
    },
    quantity: {
        type: Number,
        required: true,
    },
    stock: {
        type: Boolean,
        default: true,
    },
    addedAt: {
        type: Date,
        default: Date.now
    },

})


const Product = mongoose.models.products || mongoose.model("products", productSchema)

export default Product