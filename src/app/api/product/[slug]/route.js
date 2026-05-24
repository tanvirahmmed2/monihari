import { NextResponse } from "next/server";
import { pool } from "@/lib/database/db";

export async function GET(req, { params }) {
    try {
        const { slug } = await params;
        const productRes = await pool.query(`
            SELECT p.*, c.category_id, c.name as category_name, b.name as brand_name 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.category_id
            LEFT JOIN brands b ON p.brand_id = b.brand_id
            WHERE p.slug = $1
        `, [slug]);

        let product = productRes.rows[0];

        if (!product) {
            return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
        }

        // Fetch variants for this product
        const variantsRes = await pool.query(
            `SELECT * FROM product_variants WHERE product_id = $1 ORDER BY variant_id ASC`,
            [product.product_id]
        );
        product.variants = variantsRes.rows;

        return NextResponse.json({
            success: true,
            payload: product
        });

    } catch (error) {
        console.error("API Error (Product By Slug):", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}