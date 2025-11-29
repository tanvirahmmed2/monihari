import mongoose from "mongoose";


const orderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    orderItems: [
        {
            title: { type: String, required: true },
            productId: { type: String, required: true, trim: true },
            price: { type: String, required: true },
            quantity: { type: Number, required: true }
        }
    ],
    paymentStatus: {
        type: String,
        required: true,
        enum: ['paid', 'cashondelivery', 'unpaid'],
        default: 'unpaid'
    },
    orderStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'canceled', 'delivered'],
        default: 'pending'
    },
    orderedAt: {
        type: Date,
        default: Date.now
    }
})



const Order = mongoose.models.orders || mongoose.model('orders', orderSchema)


export default Order