import { NextResponse } from "next/server";


export async function GET(_, { params }) {
    try {

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch data',
            error: error
        }, { status: 500 })

    }

}