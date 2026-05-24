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

        const latestProducts = latestRes.rows;
        const topProducts = topRes.rows;
        const allProducts = [...latestProducts, ...topProducts];

        if (allProducts.length > 0) {
            const productIds = Array.from(new Set(allProducts.map(p => p.product_id)));
            const variantsRes = await pool.query(
                `SELECT * FROM product_variants WHERE product_id = ANY($1) ORDER BY variant_id ASC`,
                [productIds]
            );
            const variantsByProduct = {};
            for (const v of variantsRes.rows) {
                if (!variantsByProduct[v.product_id]) variantsByProduct[v.product_id] = [];
                variantsByProduct[v.product_id].push(v);
            }
            for (const p of latestProducts) {
                p.variants = variantsByProduct[p.product_id] || [];
            }
            for (const p of topProducts) {
                p.variants = variantsByProduct[p.product_id] || [];
            }
        }

        return NextResponse.json({
            success: true,
            latest: latestProducts,
            top: topProducts,
        }, { status: 200 });

    } catch (error) {
        console.error("Showcase API Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
