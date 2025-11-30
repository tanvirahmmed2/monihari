import { ConnectDB } from "@/lib/mongoose";
import Product from "@/models/product";
import { NextResponse } from "next/server";


export async function GET(req, { params }) {
    try {
        await ConnectDB()

        const tempCate = await params
        const category = tempCate.slug

        const products = await Product.find({ category }).sort({ _id: -1 }).lean()

        if (!products || products === null) {
            return NextResponse.json({
                success: false,
                message: 'No Product found in same category'
            }, { status: 400 })

        }

        return NextResponse.json({
            success: true,
            message: 'Successfully fetched product',
            payload: products
        }, { status: 200 })
        
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "failed to fetch categorized data",
            error: error
        }, { status: 500 })

    }

}