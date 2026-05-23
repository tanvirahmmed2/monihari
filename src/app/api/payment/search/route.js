import { pool } from "@/lib/database/db";
import { NextResponse } from "next/server";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get('q');


    try {
        const query = `
            SELECT 
                p.transaction_id,
                p.amount AS payment_amount,
                p.payment_method,
                o.order_id,
                o.total_discount_amount AS discount,
                c.phone,
                c.name,
                p.created_at AS date
            FROM payments p
            JOIN orders o ON p.order_id = o.order_id
            JOIN customers c ON o.customer_id = c.customer_id
            WHERE c.phone ILIKE $1 
               OR CAST(o.order_id AS TEXT) = $2 
               OR p.transaction_id ILIKE $1
            ORDER BY p.created_at DESC
        `;

        const data = await pool.query(query, [`%${searchTerm}%`, searchTerm]);

        return NextResponse.json({
            success: true,
            payload: data.rows
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}