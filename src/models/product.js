import mongoose from "mongoose";

const productScehma= new mongoose.Schema({
    title:{
        type: String,
        required: true,
        trim: true
    },
    category:{
        type: String,
        required: true,
        trim: true
    },
    description:{
        type: String,
        trim: true
    },
    price:{
        type: String,
        required: true,
        trim: true
    },
    wholeSalePrice:{
        type: String,
        required: true,
        trim: true
    },
    discount:{
        type: String,
        trim: true,
        default:''
    },
    quantity:{
        type: String,
        required: true,
        trim: true
    },
    stock:{
        type: Boolean,
        default: true,
    },
    addedAt:{
        type: Date,
        default: Date.now()
    },
    
})


const Product= mongoose.model("products", productScehma)

export default Product