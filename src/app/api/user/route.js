import { ConnectDB } from "@/lib/mongoose";
import { NextResponse } from "next/server";
import bcrypt from 'bcryptjs'
import User from "@/models/user";

export async function POST(req) {
    try {
        await ConnectDB()

        const { name, email, phone, password } = await req.json()

        if (!name || !email || !phone || !password) {
            return NextResponse.json({
                success: false,
                message: 'All required fields must be filled'
            }, { status: 400 })
        }
        const existUser = await User.findOne({ email })
        if (existUser) {
            return NextResponse.json({
                success: false,
                message: 'User already exists'
            }, { status: 400 })
        }

        const hashedPass = await bcrypt.hash(password, 10);

        const newUser = new User({ name, email, phone, password: hashedPass })

        await newUser.save()

        return NextResponse.json({
            success: true,
            message: "Successfully registered",
            payload: newUser
        }, { status: 200 })


    } catch (e) {
        return NextResponse.json({ message: 'Failed to register', error: e.message }, { status: 500 })
    }

}


export async function GET() {
    try {

    } catch (error) {
        return NextResponse.json({})

    }

}