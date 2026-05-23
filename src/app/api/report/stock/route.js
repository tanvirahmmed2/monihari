import { pool } from "@/lib/database/db";
import { NextResponse } from "next/server";

export async function GET() {
    const client = await pool.connect();
    try {
        const stockStatsQuery = `
            SELECT 
                COALESCE(SUM(stock), 0) AS total_remaining_stock,
                (SELECT COALESCE(SUM(quantity), 0) FROM order_items) AS total_sold_stock
            FROM products;
        `;

        const lowStockQuery = `
            SELECT name, stock, sale_price FROM products
            ORDER BY stock ASC LIMIT 30;
        `;

        const highStockQuery = `
            SELECT name, stock, sale_price FROM products
            ORDER BY stock DESC LIMIT 50;
        `;

        const [statsRes, lowRes, highRes] = await Promise.all([
            client.query(stockStatsQuery),
            client.query(lowStockQuery),
            client.query(highStockQuery)
        ]);

        return NextResponse.json({
            success: true,
            payload: {
                stats: statsRes.rows[0],
                lowStock: lowRes.rows,
                highStock: highRes.rows
            }
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}