import { pool } from "@/lib/database/db";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const q = searchParams.get('q') || '';
        const searchTerm = `%${q}%`;

        const query = `
            SELECT 
                pp.payment_id,
                pp.purchase_id,
                pp.payment_method,
                pp.amount_paid AS paid_amount,
                pp.payment_date AS date,
                p.supplier_name,
                p.invoice_no,
                p.total_amount AS bill_total,
                (SELECT COUNT(*) FROM purchase_items WHERE purchase_id = p.purchase_id) AS total_products
            FROM purchase_payments pp
            JOIN purchases p ON pp.purchase_id = p.purchase_id
            WHERE p.supplier_name ILIKE $1 
               OR p.invoice_no ILIKE $1
            ORDER BY pp.payment_date DESC
        `;

        const data = await pool.query(query, [searchTerm]);
        
        return NextResponse.json({ 
            success: true, 
            payload: data.rows 
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}