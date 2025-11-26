import mongoose from "mongoose";

export const ConnectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("successfully connected to mongoDB")
    } catch (error) {
        console.log(error)
        
    }
    
}