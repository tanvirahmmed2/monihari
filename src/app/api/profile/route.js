import { ConnectDB } from "@/lib/mongoose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken'
import User from "@/models/user";

export async function GET() {
    try {
        await ConnectDB()

        const token = (await cookies()).get('user_token')?.value

        const data = jwt.verify(token, process.env.JWT_SECRET)

        if (!data || data == null) {
            return NextResponse.json({
                success: false,
                message: 'Please log in'
            }, { status: 400 })
        }

        const user = await User.findById(data.id)

        if (!user || user == null) {
            return NextResponse.json({
                success: false,
                message: 'User not found'
            }, { status: 400 })
        }


        return NextResponse.json({
            success: true,
            message: "Successfully fetched data",
            payload: user
        }, { status: 200 })


    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Failed to fetch data",
            error: error
        }, { status: 500 })
    }

}