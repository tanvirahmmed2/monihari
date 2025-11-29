import { ConnectDB } from "@/lib/mongoose";
import Product from "@/models/product";
import { NextResponse } from "next/server";
import slugify from 'slugify'

export async function POST(req) {
    try {
        await ConnectDB()

        const { title, category, description, price, wholeSalePrice, discount, quantity } = await req.json()
        if (!title || !category || !description || !price || !wholeSalePrice || !quantity) {
            return NextResponse.json({
                success: false,
                message: 'Please fill all the required fields'
            }, { status: 400 })
        }

        const slug = slugify(title.trim())

        const existProduct = await Product.findOne({ slug })
        if (!existProduct) {
            return NextResponse.json({
                success: false,
                message: 'Product already exists, fix the title'
            }, { status: 400 })
        }
        if(!req.file){

        }


    } catch (error) {

    }

}