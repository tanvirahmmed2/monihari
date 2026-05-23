import { pool } from "@/lib/database/db";

import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    try {
const { id } = await params;
        if (!id) {
            return NextResponse.json({
                success: false, message: 'Category id not received',
            }, { status: 400 });
        }

        const data = await pool.query(
            `SELECT * FROM products WHERE (category_id = $1 OR sub_category_id = $1) ORDER BY created_at DESC LIMIT 50`,
            [id]
        );
        const result = data.rows;

        if (result.length === 0) {
            return NextResponse.json({
                success: false, message: 'No product found'
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