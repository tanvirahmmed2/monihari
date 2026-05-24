import { pool } from "@/lib/database/db";

import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    try {
const { id } = await params;
        if (!id) {
            return NextResponse.json({
                success: false, message: 'Category id not received',
            }, { status: 400 });
        }

        const data = await pool.query(
            `SELECT * FROM products WHERE category_id IN (SELECT category_id FROM categories WHERE category_id = $1 OR parent_id = $1) ORDER BY created_at DESC LIMIT 50`,
            [id]
        );
        const result = data.rows;

        if (result.length === 0) {
            return NextResponse.json({
                success: false, message: 'No product found'
            }, { status: 404 });
        }

        // Attach variants to each product
        const productIds = result.map(p => p.product_id);
        const variantsRes = await pool.query(
            `SELECT * FROM product_variants WHERE product_id = ANY($1) ORDER BY variant_id ASC`,
            [productIds]
        );
        const variantsByProduct = {};
        for (const v of variantsRes.rows) {
            if (!variantsByProduct[v.product_id]) variantsByProduct[v.product_id] = [];
            variantsByProduct[v.product_id].push(v);
        }
        for (const p of result) {
            p.variants = variantsByProduct[p.product_id] || [];
        }

        return NextResponse.json({
            success: true, message: 'Successfully fetched data', payload: result
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({
            success: false, message: error.message
        }, { status: 500 });
    }
}