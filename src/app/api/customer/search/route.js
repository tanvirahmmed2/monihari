import { pool } from "@/lib/database/db";
import { NextResponse } from "next/server";

export async function GET(req) {
    const client = await pool.connect();
    try {
        const { searchParams } = new URL(req.url);
        const searchTerm = searchParams.get('q');

       

        const query = `
            SELECT 
                c.name,
                c.phone,
                COUNT(o.order_id) AS total_orders,
                COALESCE(SUM(o.total_amount), 0) AS total_purchased_amount
            FROM customers c
            LEFT JOIN orders o ON c.customer_id = o.customer_id
            WHERE c.phone ILIKE $1 OR c.name ILIKE $1
            GROUP BY c.customer_id, c.name, c.phone
            ORDER BY total_purchased_amount DESC
        `;

        const data = await client.query(query, [`%${searchTerm}%`]);
        const result = data.rows;

        if (result.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'No customer found matching that search'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Successfully fetched customer data',
            payload: result
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}

