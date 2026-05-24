import { pool } from "@/lib/database/db";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ success: false, message: 'Purchase ID is required' }, { status: 400 });
        }

        const query = `
            SELECT
                p.*,
                COALESCE(
                    (SELECT json_agg(json_build_object(
                        'name',           pr.name,
                        'quantity',       pi.quantity,
                        'purchase_price', pi.purchase_price,
                        'variant_name',   pv.variant_name
                    ))
                    FROM purchase_items pi
                    JOIN products pr ON pi.product_id = pr.product_id
                    LEFT JOIN product_variants pv ON pi.variant_id = pv.variant_id
                    WHERE pi.purchase_id = p.purchase_id
                ), '[]') AS items
            FROM purchases p
            WHERE p.purchase_id = $1
        `;

        const res = await pool.query(query, [id]);

        if (res.rowCount === 0) {
            return NextResponse.json({ success: false, message: 'Purchase not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, payload: res.rows[0] }, { status: 200 });

    } catch (error) {
        console.error("Purchase fetch error:", error.message);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
