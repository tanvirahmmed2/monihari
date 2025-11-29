import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    district: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    passwordResetToken: {
        type: String,
        trim: true,
        default: null
    },
    resetTokenValidity: {
        type: Date,
        trim: true,
        default: null
    },
    cart: [
        {
            title: { type: String, required: true },
            productId: { type: String, required: true, trim: true }

        }
    ],
    saved: [
        {
            title: { type: String, required: true },
            productId: { type: String, required: true, trim: true }

        }
    ],
    orders: [
        {
            orderId: { type: String, required: true, trime: true },
            orderStatus: { type: String, required: true, trim: true }

        }
    ],
    joined: {
        type: Date,
        default: Date.now()
    },


})

const User = mongoose.model('users', userSchema)


export default User