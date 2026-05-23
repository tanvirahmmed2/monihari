import { pool } from "@/lib/database/db";
import { NextResponse } from "next/server";

// Public endpoint — no auth required
// Query by:  ?orderId=123   OR   ?phone=01700000000
export async function GET(req) {
    try {
const { searchParams } = new URL(req.url);
        const orderId = searchParams.get('orderId')?.trim();
        const phone   = searchParams.get('phone')?.trim();

        if (!orderId && !phone) {
            return NextResponse.json(
                { success: false, message: 'Please provide an Order ID or phone number.' },
                { status: 400 }
            );
        }

        // Base query — returns one or many orders depending on search type
        const baseSelect = `
            SELECT 
                o.order_id,
                o.subtotal_amount,
                o.total_discount_amount,
                o.total_amount,
                o.due_amount,
                o.delivery_charge,
                o.shipping_address,
                o.note,
                o.status,
                o.created_at,
                c.name,
                c.phone,
                p.payment_method,
                p.payment_status,
                p.amount_received AS paid_amount,
                p.change_amount,
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'name',     pr.name,
                        'image',    pr.image,
                        'quantity', oi.quantity,
                        'price',    oi.price
                    ) ORDER BY pr.name
                ) AS items
            FROM orders o
            JOIN customers   c  ON o.customer_id  = c.customer_id
            JOIN payments    p  ON o.order_id     = p.order_id
            JOIN order_items oi ON o.order_id     = oi.order_id
            JOIN products    pr ON oi.product_id  = pr.product_id
        `;

        let query, values;

        if (orderId) {
            query = `${baseSelect}
                WHERE o.order_id = $1
                GROUP BY 
                    o.order_id, o.subtotal_amount, o.total_discount_amount, o.total_amount, 
                    o.due_amount, o.delivery_charge, o.shipping_address, o.note, o.status, o.created_at,
                    c.name, c.phone, p.payment_method, p.payment_status, p.amount_received, p.change_amount`;
            values = [orderId];
        } else {
            // Phone search — return all orders for that phone, newest first
            query = `${baseSelect}
                WHERE c.phone = $1
                GROUP BY 
                    o.order_id, o.subtotal_amount, o.total_discount_amount, o.total_amount, 
                    o.due_amount, o.delivery_charge, o.shipping_address, o.note, o.status, o.created_at,
                    c.name, c.phone, p.payment_method, p.payment_status, p.amount_received, p.change_amount
                ORDER BY o.created_at DESC`;
            values = [phone];
        }

        const { rows } = await pool.query(query, values);

        if (rows.length === 0) {
            return NextResponse.json(
                { success: false, message: orderId ? 'No order found with that ID.' : 'No orders found for that phone number.' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            payload: orderId ? rows[0] : rows   // single object vs array
        }, { status: 200 });

    } catch (error) {
        console.error('Order Track Error:', error.message);
        return NextResponse.json({ success: false, message: 'Something went wrong. Please try again.' }, { status: 500 });
    }
}
