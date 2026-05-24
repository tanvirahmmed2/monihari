import { pool } from "@/lib/database/db";
import { NextResponse } from "next/server";

/* ─── Helper: deduct stock (variant-aware) ────────────────────────────── */
async function deductStock(client, item) {
    if (item.variant_id) {
        // Product has variants — deduct from the specific variant's stock
        const res = await client.query(
            `UPDATE product_variants SET stock = stock - $1 WHERE variant_id = $2 AND stock >= $1`,
            [item.quantity, item.variant_id]
        );
        if (res.rowCount === 0) throw new Error(`Insufficient stock for variant: ${item.variant_id}`);
    } else {
        // No variant_id — check if product is variant-managed; if so, skip base stock
        const { rows } = await client.query(
            `SELECT COUNT(*) AS cnt FROM product_variants WHERE product_id = $1`,
            [item.product_id]
        );
        if (parseInt(rows[0].cnt) > 0) return; // variant-managed — base stock is irrelevant

        const res = await client.query(
            `UPDATE products SET stock = stock - $1 WHERE product_id = $2 AND stock >= $1`,
            [item.quantity, item.product_id]
        );
        if (res.rowCount === 0) throw new Error(`Insufficient stock for Product ID: ${item.product_id}`);
    }
}

export async function POST(req) {
    const client = await pool.connect();
    try {
        const {
            customerName, phone, items, subtotal, discount,
            total, paymentMethod, transactionId, address, note, deliveryCharge
        } = await req.json();

        if (!phone) throw new Error("Phone number is required");
        if (!items || items.length === 0) throw new Error("Order must contain at least one item");

        // Stock pre-check — validate all items before inserting anything
        for (const item of items) {
            if (item.variant_id) {
                const { rows } = await client.query(
                    `SELECT stock FROM product_variants WHERE variant_id = $1`,
                    [item.variant_id]
                );
                if (!rows[0] || rows[0].stock < item.quantity) {
                    throw new Error(`Insufficient stock for the selected variant. Please refresh and try again.`);
                }
            } else {
                // Check if product has variants
                const { rows: vRows } = await client.query(
                    `SELECT COUNT(*) AS cnt FROM product_variants WHERE product_id = $1`,
                    [item.product_id]
                );
                if (parseInt(vRows[0].cnt) === 0) {
                    // Non-variant product — check base stock
                    const { rows } = await client.query(
                        `SELECT stock FROM products WHERE product_id = $1`,
                        [item.product_id]
                    );
                    if (!rows[0] || rows[0].stock < item.quantity) {
                        throw new Error(`Insufficient stock for Product ID: ${item.product_id}`);
                    }
                }
            }
        }

        await client.query('BEGIN');

        // 1. Upsert customer
        let customer_id;
        const customerCheck = await client.query(
            "SELECT customer_id FROM customers WHERE phone = $1",
            [phone]
        );

        if (customerCheck.rows.length > 0) {
            customer_id = customerCheck.rows[0].customer_id;
            if (address) {
                await client.query(
                    "UPDATE customers SET address = $1, name = $2 WHERE customer_id = $3",
                    [address, customerName, customer_id]
                );
            }
        } else {
            const newCustomer = await client.query(
                "INSERT INTO customers (name, phone, address) VALUES ($1, $2, $3) RETURNING customer_id",
                [customerName || 'Guest Customer', phone, address || '']
            );
            customer_id = newCustomer.rows[0].customer_id;
        }

        // 2. Insert Order (status = 'pending' — stock deducted at confirmation)
        const orderRes = await client.query(
            `INSERT INTO orders (customer_id, phone, shipping_address, delivery_charge, note, subtotal_amount, total_discount_amount, total_amount, due_amount, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING order_id`,
            [customer_id, phone, address || '', deliveryCharge || 0, note || '', subtotal, discount, total, total, 'pending']
        );
        const orderId = orderRes.rows[0].order_id;

        // 3. Insert order items — store variant_id so confirm can deduct correct stock
        for (const item of items) {
            const variantId = item.variant_id || null;
            await client.query(
                `INSERT INTO order_items (order_id, product_id, variant_id, quantity, price) VALUES ($1, $2, $3, $4, $5)`,
                [orderId, item.product_id, variantId, item.quantity, item.price]
            );
        }

        // 4. Insert Payment record
        await client.query(
            "INSERT INTO payments (order_id, payment_method, amount, payment_status, transaction_id) VALUES ($1, $2, $3, $4, $5)",
            [orderId, paymentMethod, total, 'pending', transactionId || null]
        );

        await client.query('COMMIT');

        const receiptData = {
            orderId,
            orderDate: new Date().toISOString(),
            customerName: customerName || 'Guest Customer',
            phone,
            address: address || '',
            note: note || '',
            items,
            subtotal,
            discount,
            deliveryCharge: deliveryCharge || 0,
            total,
            paymentMethod,
            transactionId: transactionId || null,
            status: 'pending'
        };

        return NextResponse.json({
            success: true,
            message: 'Order received! Our team will call you soon for confirmation.',
            orderId,
            receiptData
        }, { status: 201 });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Order Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}