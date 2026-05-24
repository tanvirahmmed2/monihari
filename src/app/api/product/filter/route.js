import { pool } from "@/lib/database/db";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
const { searchParams } = new URL(req.url);
        const category_id = searchParams.get('category');
        const sort      = searchParams.get('sort') || 'latest';       // latest | price_asc | price_desc
        const minPrice  = parseFloat(searchParams.get('minPrice')) || null;
        const maxPrice  = parseFloat(searchParams.get('maxPrice')) || null;
        const page  = parseInt(searchParams.get('page')) || 1;
        const limit = 20;
        const offset = (page - 1) * limit;

        let params = [];
        let where  = `WHERE 1=1`;

        if (category_id && category_id !== '') {
            params.push(category_id);
            where += ` AND category_id IN (SELECT category_id FROM categories WHERE category_id = $${params.length} OR parent_id = $${params.length})`;
        }

        if (minPrice !== null) {
            params.push(minPrice);
            where += ` AND (sale_price - COALESCE(discount_price, 0)) >= $${params.length}`;
        }

        if (maxPrice !== null) {
            params.push(maxPrice);
            where += ` AND (sale_price - COALESCE(discount_price, 0)) <= $${params.length}`;
        }

        // Sorting
        const orderMap = {
            latest:      'created_at DESC',
            price_asc:   '(sale_price - COALESCE(discount_price, 0)) ASC',
            price_desc:  '(sale_price - COALESCE(discount_price, 0)) DESC',
        };
        const orderBy = orderMap[sort] || orderMap.latest;

        const countQuery = `SELECT COUNT(*) FROM products ${where}`;
        const totalRes   = await pool.query(countQuery, params);
        const totalItems = parseInt(totalRes.rows[0].count);
        const totalPages = Math.ceil(totalItems / limit) || 1;

        params.push(limit, offset);
        const dataQuery = `SELECT * FROM products ${where} ORDER BY ${orderBy} LIMIT $${params.length - 1} OFFSET $${params.length}`;
        const data = await pool.query(dataQuery, params);
        const products = data.rows;

        // Attach variants to each product
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

        return NextResponse.json({
            success: true,
            message: products.length > 0 ? 'Successfully fetched data' : 'No product found',
            payload: products,
            pagination: { totalItems, totalPages, currentPage: page }
        }, { status: 200 });

    } catch (error) {
        console.error("Filter API Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}