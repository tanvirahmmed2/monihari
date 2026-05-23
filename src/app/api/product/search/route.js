import { pool } from "@/lib/database/db";

import { NextResponse } from "next/server";

export async function GET(req) {
    try {
const { searchParams } = new URL(req.url);
        const q = searchParams.get("q") || "";

        let query = `
            SELECT *
            FROM products
            
        `;
        const values = [];

        if (q) {
            query += `
              AND (COALESCE(name, '') ILIKE $2 
                 OR COALESCE(barcode, '') ILIKE $2)
         `;
            values.push(`%${q}%`);
        }

        query += ` ORDER BY created_at DESC LIMIT 10`;

        const data = await pool.query(query, values);
        const result = data.rows;

        return NextResponse.json(
            { success: true, message: 'Successfully fetched data', payload: result },
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
