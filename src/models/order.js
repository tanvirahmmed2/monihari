import mongoose from "mongoose";


const orderSchema= new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    




    orderStatus:{
        type: String,
        enum:['pending','canceled', 'delivered']
    }
})



const Order= mongoose.model('orders', orderSchema)


export default Order