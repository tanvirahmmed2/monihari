import mongoose from "mongoose";

const messageSchema= new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
         trim: true,
         required: true
    },
    body:{
        type: String,
        trim: true,
        required: true
    },
    sendAt:{
        type: Date,
        default: Date.now()
    }
})

const Message= mongoose.model('messages', messageSchema)

export default Message