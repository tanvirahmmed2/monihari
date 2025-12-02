import { ConnectDB } from "@/lib/mongoose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken'
import User from "@/models/user";


export async function GET(_, { params }) {
    try {
        await ConnectDB()

        const token = (await cookies()).get('user_token')?.value

        if (!token) {
            return NextResponse.json({
                success: false,
                message: 'Please Login'
            }, { status: 400 })
        }

        const decode = jwt.verify(token, process.env.JWT_SECRET)

        const user = await User.findById(decode.id)

        if (!user) {
            return NextResponse.json({
                success: false,
                message: 'User not found'
            }, { status: 400 })
        }

        if(!user){
             return NextResponse.json({
                success: false,
                message: 'User not found'
            }, { status: 400 })
        }

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch data',
            error: error
        }, { status: 500 })

    }

}