import { pool } from "@/lib/database/db";
import { NextResponse } from "next/server";

export async function GET() {
    const client = await pool.connect();
    try {
        const statsQuery = `
            SELECT 
                COALESCE(SUM(total_amount), 0) AS total_revenue,
                (SELECT COALESCE(SUM(oi.quantity), 0) FROM order_items oi JOIN orders o ON oi.order_id = o.order_id WHERE o.status IN ('confirmed', 'shipped', 'delivered', 'completed', 'confirm')) AS total_items_sold
            FROM orders 
            WHERE status IN ('confirmed', 'shipped', 'delivered', 'completed', 'confirm');
        `;

        const topProductsQuery = `
            SELECT 
                p.name, 
                SUM(oi.quantity) AS sold_qty,
                SUM(oi.quantity * oi.price) AS revenue
            FROM order_items oi
            JOIN products p ON oi.product_id = p.product_id
            JOIN orders o ON oi.order_id = o.order_id
            WHERE o.status IN ('confirmed', 'shipped', 'delivered', 'completed', 'confirm')
            GROUP BY p.product_id, p.name
            ORDER BY sold_qty DESC
            LIMIT 10;
        `;

        const [statsRes, topRes] = await Promise.all([
            client.query(statsQuery),
            client.query(topProductsQuery)
        ]);

        return NextResponse.json({
            success: true,
            payload: {
                stats: statsRes.rows[0],
                topProducts: topRes.rows
            }
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}