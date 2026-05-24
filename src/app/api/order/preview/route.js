import { pool } from "@/lib/database/db";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    try {
const { id } = await params;

        if (!id) {
            return NextResponse.json({
                success: false, 
                message: 'Order ID is required'
            }, { status: 400 });
        }

        const query = `
            SELECT 
                c.name AS customer_name,
                c.phone AS customer_phone,
                o.order_id,
                o.total_amount,
                o.total_discount_amount,
                o.subtotal_amount,
                o.status,
                p.payment_status,
                p.change_amount,
                p.amount_received AS paid_amount,
                o.created_at,
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'name', pr.name, 
                        'quantity', oi.quantity,
                        'price', oi.price,
                        'sale_price', pr.sale_price, 
                        'discount_price', pr.discount_price,
                        'barcode', pr.barcode,
                        'variant_name', pv.variant_name
                    )
                ) AS items
            FROM orders o
            JOIN customers c    ON o.customer_id = c.customer_id
            JOIN payments p     ON o.order_id    = p.order_id
            JOIN order_items oi ON o.order_id    = oi.order_id
            JOIN products pr    ON oi.product_id = pr.product_id
            LEFT JOIN product_variants pv ON oi.variant_id = pv.variant_id
            WHERE o.order_id = $1
            GROUP BY 
                o.order_id, 
                c.name, 
                c.phone, 
                o.total_amount,
                o.total_discount_amount,
                o.subtotal_amount,
                o.status,
                p.payment_status, 
                p.change_amount, 
                p.amount_received,
                o.created_at
        `;

        const data = await pool.query(query, [id]);

        if (data.rowCount === 0) {
            return NextResponse.json({
                success: false, 
                message: 'Order not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            payload: data.rows[0] 
        }, { status: 200 });

    } catch (error) {
        console.error("Fetch Order Error:", error.message);
        return NextResponse.json({ 
            success: false, 
            message: "Internal Server Error" 
        }, { status: 500 });
    }
}