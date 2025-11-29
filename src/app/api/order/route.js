import { ConnectDB } from "@/lib/mongoose";
import Order from "@/models/order";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        await ConnectDB()

        const { name, phone, email, totalPrice, paymentStatus, orderItems } = await req.json()

        if (!name || !phone || !email || totalPrice) {
            return NextResponse.json({
                success: false,
                message: "Enough resource not found"
            }, { status: 400 })
        }
        if (orderItems === null) {
            return NextResponse.json({
                success: false,
                message: "Please add items"
            }, { status: 400 })
        }

        const newOrder = new Order({ name, phone, email, totalPrice, paymentStatus, orderItems })

        await newOrder.save()

        return NextResponse.json({
            success: true,
            message: 'Successfully placed order'
        }, { status: 200 })



    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Failed to place order",
            error: error
        }, { status: 500 })
    }

}


export async function GET() {
    try {
        await ConnectDB()

        const orders = await Order.find({}).sort({ _id: -1 })

        if (!orders || orders === null) {
            return NextResponse.json({
                success: false,
                message: "No order available"
            }, { status: 400 })
        }

        return NextResponse.json({
            success: true,
            message: "successfully fetched orders",
            payload: orders

        }, { status: 200 })
        
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Failed to fetch order",
            error: error
        }, { status: 500 })
    }

}