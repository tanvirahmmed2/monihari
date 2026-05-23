import { pool } from "@/lib/database/db";

import { NextResponse } from "next/server";

export async function POST(req) {
    const client = await pool.connect();
    try {
        const { product_id, quantity, sale_price, customer_id } = await req.json();
        const total_deduction = parseFloat(sale_price) * parseInt(quantity);
await client.query('BEGIN');

        // 1. Create a Negative Order to adjust revenue
        const negOrderQuery = `
            INSERT INTO orders (customer_id, total_amount, status, created_at)
            VALUES ($1, $2, 'returned', CURRENT_TIMESTAMP, $3)
            RETURNING order_id;
        `;
        
        await client.query(negOrderQuery, [customer_id || null, -total_deduction]);

        const restoreStockQuery = `
            UPDATE products 
            SET stock = stock + $1 
            WHERE product_id = $2
            RETURNING name, stock;
        `;
        const productRes = await client.query(restoreStockQuery, [quantity, product_id]);

        await client.query('COMMIT');

        return NextResponse.json({ 
            success: true, 
            message: `Return processed. ${productRes.rows[0].name} stock is now ${productRes.rows[0].stock}.` 
        });

    } catch (error) {
        await client.query('ROLLBACK');
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}