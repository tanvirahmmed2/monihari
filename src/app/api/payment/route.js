import { pool } from "@/lib/database/db";

import { NextResponse } from "next/server";

export async function GET() {
    try {
        const query = `
                p.payment_id,
                p.order_id,
                p.transaction_id,
                o.subtotal_amount AS subtotal,
                o.total_amount AS payment_amount,
                o.total_discount_amount AS discount,
                o.shipping_address,
                o.delivery_charge,
                o.note,
                c.phone,
                c.name,
                p.paid_at AS date
            FROM payments p
            JOIN orders o ON p.order_id = o.order_id
            JOIN customers c ON o.customer_id = c.customer_id
            WHERE o.status IN ('confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered')
            ORDER BY p.paid_at DESC
        `;

        const data = await pool.query(query, []);
        const result = data.rows;
        
        if (result.length <= 0) {
            return NextResponse.json({
                success: false, message: 'No history found'
            }, { status: 404 })
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Successfully fetched data',
            payload: result 
        }, { status: 200 });

    } catch (error) {
        console.error("Transaction Fetch Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}