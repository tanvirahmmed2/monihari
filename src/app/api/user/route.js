import { ConnectDB } from "@/lib/mongoose";
import User from "@/models/user";
import { NextResponse } from "next/server";



export async function POST(request) {
    try {
        await ConnectDB()

        const { name, email } = await request.json()

        const existUser = await User.findOne({ email })
        if (existUser) {
            return NextResponse.json({
                message: 'User already exists'
            }, { status: 400 })
        }
        const newUser = new User({ name, email })

        await newUser.save()
        return NextResponse.json({
            message: 'Successfully created new user'
        }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: "failed to create new user", error: error }, { status: 500 })

    }

}