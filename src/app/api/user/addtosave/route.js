import { ConnectDB } from "@/lib/mongoose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken'
import User from "@/models/user";
import Product from "@/models/product";


export async function POST(req) {
    try {
        await ConnectDB()

        const { productId } = await req.json()

        if (!productId) {
            return NextResponse.json({
                success: false,
                message: "Product id missing"
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

        const productExists = user.saved.find(
            (item) => item.productId === productId
        );


        if (productExists) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Product already saved",
                },
                { status: 400 }
            );
        }


        user.saved.push({
            title: product.title,
            slug:product.slug,
            price: product.price,
            productId: productId,
        })

        await user.save()

        return NextResponse.json({
            success: true,
            message: 'Successfully added saved'
        }, { status: 200 })



    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Failed to add product",
            error: error

        }, { status: 500 })

    }

}