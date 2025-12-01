import { ConnectDB } from "@/lib/mongoose";
import Product from "@/models/product";
import { NextResponse } from "next/server";



export async function GET() {
    try {
        await ConnectDB()

        const products= await Product.find({}).sort({addedAt: -1}).limit(8)
        if(!products || products=== null){
            return NextResponse.json({
                success: false,
                message: 'Product not found'
            }, {status: 400})
        }

        return NextResponse.json({
            success: true,
            message: "Successfully fetched data",
            payload: products
        }, {status: 200})
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch product data',
            error: error
        }, {status: 500})
        
    }
    
}