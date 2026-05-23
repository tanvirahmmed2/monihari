import { pool } from "@/lib/database/db";
import { NextResponse } from "next/server";

const VALID_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned'];

export async function GET(req) {
    const client = await pool.connect();
    const { searchParams } = new URL(req.url);
    const filterStatus = searchParams.get('q');

    try {
if (!filterStatus || !VALID_STATUSES.includes(filterStatus)) {
            return NextResponse.json({
                success: false,
                message: `Valid status required: ${VALID_STATUSES.join(', ')}`
            }, { status: 400 });
        }

        const query = `
            SELECT 
                o.order_id,
                c.name,
                c.phone,
                o.total_amount,
                o.due_amount,
                o.total_discount_amount AS discount,
                o.subtotal_amount AS subtotal,
                o.status,
                p.payment_status,
                p.payment_method,
                p.transaction_id,
                p.amount_received,
                p.change_amount,
                o.shipping_address,
                o.delivery_charge,
                o.note,
                o.created_at AS date,
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'name', pr.name, 
                        'quantity', oi.quantity,
                        'price', oi.price,
                        'sale_price', pr.sale_price,
                        'discount_price', pr.discount_price
                    )
                ) AS product_list
            FROM orders o
            JOIN customers c    ON o.customer_id = c.customer_id
            JOIN payments p     ON o.order_id    = p.order_id
            JOIN order_items oi ON o.order_id    = oi.order_id
            JOIN products pr    ON oi.product_id = pr.product_id
            WHERE o.status = $1
            GROUP BY 
                o.order_id, c.name, c.phone,
                o.total_amount, o.due_amount, o.total_discount_amount, o.subtotal_amount, o.status,
                p.payment_status, p.payment_method, p.transaction_id,
                p.amount_received, p.change_amount, o.created_at,
                o.shipping_address, o.delivery_charge, o.note
            ORDER BY o.created_at DESC
        `;

        const data = await client.query(query, [filterStatus]);

        return NextResponse.json({
            success: true,
            count: data.rowCount,
            payload: data.rows
        }, { status: 200 });

    } catch (error) {
        console.error("Database Error:", error.message);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}