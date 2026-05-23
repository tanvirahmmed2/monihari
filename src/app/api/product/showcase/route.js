import { pool } from "@/lib/database/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
const baseSelect = `
            SELECT p.*, c.name AS category_name, b.name AS brand_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.category_id
            LEFT JOIN brands b ON p.brand_id = b.brand_id
             `;

        // Latest 8 products
        const latestRes = await pool.query(
            `${baseSelect} ORDER BY p.created_at DESC LIMIT 8`,
            []
        );

        // Highest discounted 8 products (discount_price > 0)
        const topRes = await pool.query(
            `${baseSelect} WHERE p.discount_price > 0 ORDER BY (p.sale_price - p.discount_price) DESC LIMIT 8`,
            []
        );

        return NextResponse.json({
            success: true,
            latest: latestRes.rows,
            top: topRes.rows,
        }, { status: 200 });

    } catch (error) {
        console.error("Showcase API Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
