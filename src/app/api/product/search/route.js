import { pool } from "@/lib/database/db";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const q = searchParams.get("q") || "";

        let query = `SELECT * FROM products`;
        const values = [];

        if (q) {
            values.push(`%${q}%`);
            query += ` WHERE (COALESCE(name, '') ILIKE $1 OR COALESCE(barcode, '') ILIKE $1)`;
        }

        query += ` ORDER BY created_at DESC LIMIT 10`;

        const data = await pool.query(query, values);
        const products = data.rows;

        // Attach variants so POS/purchase forms can show variant picker
        if (products.length > 0) {
            const productIds = products.map(p => p.product_id);
            const variantsRes = await pool.query(
                `SELECT * FROM product_variants WHERE product_id = ANY($1) ORDER BY variant_id ASC`,
                [productIds]
            );
            const variantsByProduct = {};
            for (const v of variantsRes.rows) {
                if (!variantsByProduct[v.product_id]) variantsByProduct[v.product_id] = [];
                variantsByProduct[v.product_id].push(v);
            }
            for (const p of products) {
                p.variants = variantsByProduct[p.product_id] || [];
            }
        }

        return NextResponse.json(
            { success: true, message: 'Successfully fetched data', payload: products },
            { status: 200 }
        );

    } catch (error) {
        console.error("Search API Error:", error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
