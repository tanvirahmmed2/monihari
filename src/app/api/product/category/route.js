import { pool } from "@/lib/database/db";

import { NextResponse } from "next/server";

export async function GET() {
    try {
const data = await pool.query(
            `SELECT * FROM categories  ORDER BY created_at DESC`,
            []
        );

        const result = data.rows;
        if (result.length === 0) {
            return NextResponse.json({
                success: false, message: 'No category found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true, message: 'Successfully fetched data', payload: result
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({
            success: false, message: error.message
        }, { status: 500 });
    }
}