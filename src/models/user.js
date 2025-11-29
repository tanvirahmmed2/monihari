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
        default: ''
    },
    resetTokenValidity: {
        type: Date,
        trim: true,
        default: ''
    },
    joined: {
        type: Date,
        default: Date.now()
    },


})

const User = mongoose.model('users', userSchema)


export default User