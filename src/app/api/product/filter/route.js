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
        let where  = ``;

        if (category_id && category_id !== '') {
            params.push(category_id);
            where += ` AND category_id = $${params.length}`;
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

        return NextResponse.json({
            success: true,
            message: data.rows.length > 0 ? 'Successfully fetched data' : 'No product found',
            payload: data.rows,
            pagination: { totalItems, totalPages, currentPage: page }
        }, { status: 200 });

    } catch (error) {
        console.error("Filter API Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}