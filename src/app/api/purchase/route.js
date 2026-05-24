import { pool } from "@/lib/database/db";
import { NextResponse } from "next/server";

export async function POST(req) {
    const client = await pool.connect();
    try {
        const body = await req.json();
        const {
            supplier_id,
            invoice_no,
            subtotal_amount,
            extra_discount,
            total_amount,
            payment_method,
            transaction_id,
            note,
            items
        } = body;

        if (!supplier_id || !items || items.length === 0) {
            return NextResponse.json({ success: false, message: 'Supplier and items are required' }, { status: 400 });
        }

        await client.query('BEGIN');

        // 1. Get Supplier Info
        const supplierRes = await client.query("SELECT name, phone FROM suppliers WHERE supplier_id = $1", [supplier_id]);
        if (supplierRes.rows.length === 0) throw new Error("Supplier not found");
        const { name: s_name, phone: s_phone } = supplierRes.rows[0];

        // 2. Insert Purchase Header
        const purchaseRes = await client.query(
            `INSERT INTO purchases (supplier_id, supplier_name, supplier_phone, invoice_no, subtotal_amount, extra_discount, total_amount, payment_method, transaction_id, note)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING purchase_id`,
            [supplier_id, s_name, s_phone, invoice_no, Number(subtotal_amount), Number(extra_discount), Number(total_amount), payment_method, transaction_id, note]
        );
        const purchaseId = purchaseRes.rows[0].purchase_id;

        // 3. Insert Payment
        await client.query(
            "INSERT INTO purchase_payments (purchase_id, payment_method, amount_paid, transaction_id) VALUES ($1, $2, $3, $4)",
            [purchaseId, payment_method, Number(total_amount), transaction_id]
        );

        // 4. Loop Items: Insert & Update Stock (variant-aware)
        for (const item of items) {
            const variantId = item.variant_id || null;

            await client.query(
                `INSERT INTO purchase_items (purchase_id, product_id, variant_id, quantity, purchase_price) VALUES ($1, $2, $3, $4, $5)`,
                [purchaseId, item.product_id, variantId, item.quantity, Number(item.purchase_price)]
            );

            if (variantId) {
                // Increase the specific variant's stock
                await client.query(
                    `UPDATE product_variants SET stock = stock + $1 WHERE variant_id = $2`,
                    [item.quantity, variantId]
                );
            } else {
                // No variant — increase base product stock and update purchase price
                await client.query(
                    `UPDATE products SET stock = stock + $1, purchase_price = $2 WHERE product_id = $3`,
                    [item.quantity, Number(item.purchase_price), item.product_id]
                );
            }
        }

        await client.query('COMMIT');

        return NextResponse.json({
            success: true,
            message: 'Purchase processed successfully',
            purchase_id: purchaseId
        }, { status: 201 });

    } catch (error) {
        await client.query('ROLLBACK');
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const q = searchParams.get('q') || '';
        const searchTerm = `%${q}%`;

        const query = `
            SELECT 
                p.*,
                COALESCE(
                    (SELECT json_agg(json_build_object(
                        'name', pr.name,
                        'quantity', pi.quantity,
                        'purchase_price', pi.purchase_price
                    ))
                    FROM purchase_items pi
                    JOIN products pr ON pi.product_id = pr.product_id
                    WHERE pi.purchase_id = p.purchase_id
                ), '[]') as items
            FROM purchases p
            WHERE 
                p.supplier_name ILIKE $1 
                OR p.supplier_phone ILIKE $1 
                OR p.invoice_no ILIKE $1
                OR p.created_at::text ILIKE $1
                OR EXISTS (
                    SELECT 1 FROM purchase_items pi
                    JOIN products pr ON pi.product_id = pr.product_id
                    WHERE pi.purchase_id = p.purchase_id
                    AND (pr.name ILIKE $1 OR pr.barcode ILIKE $1)
                )
            ORDER BY p.created_at DESC`;

        const res = await pool.query(query, [searchTerm]);
        return NextResponse.json({ success: true, payload: res.rows });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    const client = await pool.connect();
    try {
        const { id } = await req.json();
        if (!id) return NextResponse.json({ success: false, message: "ID missing" }, { status: 400 });

        await client.query('BEGIN');

        // 1. Get items to revert stock (variant-aware)
        const itemsRes = await client.query(
            "SELECT product_id, variant_id, quantity FROM purchase_items WHERE purchase_id = $1",
            [id]
        );

        // 2. Revert Stock
        for (const item of itemsRes.rows) {
            if (item.variant_id) {
                await client.query(
                    `UPDATE product_variants SET stock = stock - $1 WHERE variant_id = $2`,
                    [item.quantity, item.variant_id]
                );
            } else {
                await client.query(
                    `UPDATE products SET stock = stock - $1 WHERE product_id = $2`,
                    [item.quantity, item.product_id]
                );
            }
        }

        const del = await client.query("DELETE FROM purchases WHERE purchase_id = $1 RETURNING *", [id]);
        if (del.rowCount === 0) throw new Error("Purchase not found");

        await client.query('COMMIT');
        return NextResponse.json({ success: true, message: "Purchase deleted and stock reverted" });
    } catch (error) {
        await client.query('ROLLBACK');
        const msg = error.code === '23514' ? "Deletion failed: Resulting stock cannot be negative" : error.message;
        return NextResponse.json({ success: false, message: msg }, { status: 500 });
    } finally {
        client.release();
    }
}