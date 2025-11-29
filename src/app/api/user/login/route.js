import { ConnectDB } from "@/lib/mongoose";
import User from "@/models/user";
import { NextResponse } from "next/server";
import bcrypt from 'bcryptjs'


export async function POST(req) {
    try {
        await ConnectDB()

        const { email, password } = await req.json()

        if (!email || !password) {
            return NextResponse.json({
                success: false,
                message: 'required data missing'
            }, { status: 400 })
        }

        const existUser = await User.findOne({ email })
        if (!existUser) {
            return NextResponse.json({
                success: false,
                message: "User doesn't exists"
            }, { status: 400 })
        }

        const matchPass = await bcrypt.compare(password, existUser.password)

        if (!matchPass) {
            return NextResponse.json({
                success: false,
                message: "Incorrect password"
            }, { status: 400 })
        }

        return NextResponse.json({
            success: true,
            message: "Successfully logged in",
            user: existUser
        }, {status: 200})
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: 'Failed to login',
            error: error.message
        }, { status: 500 })

    }

}