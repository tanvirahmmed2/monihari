import { pool } from "@/lib/database/db";

import { NextResponse } from "next/server";

export async function POST(req) {
    const client = await pool.connect();
    try {
const { customerName, phone, items, subtotal, discount, total, paymentMethod, transactionId, address, note, deliveryCharge } = await req.json();

        if (!phone) throw new Error("Phone number is required");

        await client.query('BEGIN');
        let customer_id;
        const customerCheck = await client.query(
            "SELECT customer_id FROM customers WHERE phone = $1",
            [phone]
        );

        if (customerCheck.rows.length > 0) {
            customer_id = customerCheck.rows[0].customer_id;
            // Update customer address if provided
            if (address) {
                await client.query(
                    "UPDATE customers SET address = $1, name = $2 WHERE customer_id = $3",
                    [address, customerName, customer_id]
                );
            }
        } else {
            // Create a new guest customer record
            const newCustomer = await client.query(
                "INSERT INTO customers (name, phone, address) VALUES ($1, $2, $3, $4) RETURNING customer_id",
                [customerName || 'Guest Customer', phone, address || '']
            );
            customer_id = newCustomer.rows[0].customer_id;
        }

        // 2. Insert Order (Force status to 'pending')
        const orderRes = await client.query(
            `INSERT INTO orders (customer_id, phone, shipping_address, delivery_charge, note, subtotal_amount, total_discount_amount, total_amount, due_amount, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING order_id`,
            [customer_id, phone, address || '', deliveryCharge || 0, note || '', subtotal, discount, total, total, 'pending']
        );
        const orderId = orderRes.rows[0].order_id;

        for (const item of items) {
            await client.query(
                "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4, $5)",
                [orderId, item.product_id, item.quantity, item.price]
            );
        }

        // 4. Insert Payment (Force status to 'pending')
        await client.query(
            "INSERT INTO payments (order_id, payment_method, amount, payment_status, transaction_id) VALUES ($1, $2, $3, $4, $5, $6)",
            [orderId, paymentMethod, total, 'pending', transactionId || null]
        );

        await client.query('COMMIT');

        return NextResponse.json({ 
            success: true, 
            message: 'Order received! Our team will call you soon for confirmation.',
            orderId 
        }, { status: 201 });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Order Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}