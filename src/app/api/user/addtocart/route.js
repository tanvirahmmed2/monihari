import { ConnectDB } from "@/lib/mongoose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken'
import User from "@/models/user";
import Product from "@/models/product";


export async function POST(req) {
    try {
        await ConnectDB()

        const { productId, quantity } = await req.json()

        if (!productId || !quantity) {
            return NextResponse.json({
                success: false,
                message: "Product id or quantity missing"
            }, { status: 400 })
        }

        const product = await Product.findById(productId)

        if (!product) {
            return NextResponse.json({
                success: false,
                message: "Product not found"
            }, { status: 400 })
        }

        const token = (await cookies()).get('user_token')?.value

        if (!token) {
            return NextResponse.json({
                success: false,
                message: "Please login"
            }, { status: 400 })
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET)
        if (!decode) {
            return NextResponse.json({
                success: false,
                message: "Failed to verify token"
            }, { status: 400 })
        }

        const user = await User.findById(decode.id)

        if (!user) {
            return NextResponse.json({
                success: false,
                message: "User not found"
            }, { status: 400 })
        }

        const cartData= user.cart





    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Failed to add product",
            error: error

        }, { status: 500 })

    }

}