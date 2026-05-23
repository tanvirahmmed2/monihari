import { pool } from "@/lib/database/db";
import { NextResponse } from "next/server";

async function getOrderDetails(client, orderId) {
    const res = await client.query(`
        SELECT 
            o.order_id, o.shipping_address, o.delivery_charge, o.note, o.subtotal_amount, o.total_discount_amount, o.total_amount, o.due_amount, o.status, o.created_at,
            c.name, p.payment_method, p.payment_status, p.amount AS actual_paid, 
            p.amount_received, p.change_amount,
            JSON_AGG(JSON_BUILD_OBJECT('name', pr.name, 'quantity', oi.quantity, 'price', oi.price)) AS items
        FROM orders o
        JOIN customers c  ON o.customer_id = c.customer_id
        JOIN payments p   ON o.order_id    = p.order_id
        JOIN order_items oi ON o.order_id  = oi.order_id
        JOIN products pr  ON oi.product_id = pr.product_id
        WHERE o.order_id = $1
        GROUP BY o.order_id, c.name, p.payment_method, p.payment_status, p.amount_received, p.change_amount, p.amount
    `, [orderId]);
    return res.rows[0];
}

// ─── POST — Place new order (staff/POS) ───────────────────────────────────────
export async function POST(req) {
    const client = await pool.connect();
    try {
        const body = await req.json();
        const { customer_id, phone, items, subtotal, discount, total, paid_amount, change_amount, paymentMethod, payment_type, transactionId, status, createdAt, address, note, deliveryCharge } = body;
        
        let resolvedCustomerId = customer_id;
        
        // --- CUSTOMER LOOKUP/CREATION BY PHONE ---
        if (!resolvedCustomerId && phone) {
            const client = await pool.connect();
            try {
                // 1. Check if customer already exists in customers
                const custRes = await client.query("SELECT customer_id FROM customers WHERE phone = $1", [phone]);
                if (custRes.rowCount > 0) {
                    resolvedCustomerId = custRes.rows[0].customer_id;
                } else {
                    // 2. Not in customers. Check if a user exists with this phone to get a name
                    const userRes = await client.query("SELECT name FROM users WHERE phone = $1", [phone]);
                    const nameToUse = userRes.rowCount > 0 ? userRes.rows[0].name : 'Guest';
                    
                    // 3. Create a new customer record
                    const newCust = await client.query(
                        "INSERT INTO customers (name, phone) VALUES ($1, $2) RETURNING customer_id",
                        [nameToUse, phone]
                    );
                    resolvedCustomerId = newCust.rows[0].customer_id;
                }
            } finally {
                client.release();
            }
        }

        if (!resolvedCustomerId) throw new Error("Customer information is required");

        await client.query('BEGIN');

        // Always compute due as total minus what was actually paid
        const actualPaid = parseFloat(paid_amount) || 0;
        const due = Math.max(0, parseFloat(total) - actualPaid);

        // Determine order status — POS sends 'delivered', online orders send 'pending'
        const orderStatus = status || 'confirmed';

        // Determine payment status from the due amount, unless order is still pending
        const pStatus = orderStatus === 'pending' ? 'pending' : (due <= 0 ? 'success' : 'partial');

        // Determine payment type — POS sales are prepaid (paid at counter), online are cod by default
        const payType = payment_type || (orderStatus === 'delivered' ? 'prepaid' : 'cod');

        const orderRes = await client.query(
            `INSERT INTO orders (customer_id, phone, shipping_address, delivery_charge, note, subtotal_amount, total_discount_amount, total_amount, due_amount, payment_type, status, created_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING order_id`,
            [resolvedCustomerId, phone, address || 'POS Sale', deliveryCharge || 0, note || '', subtotal, discount, total, due, payType, orderStatus, createdAt || new Date()]
        );
        const orderId = orderRes.rows[0].order_id;

        // Deduct stock for all non-pending statuses (confirmed, delivered, processing, shipped, etc.)
        for (const item of items) {
            await client.query(
                "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
                [orderId, item.product_id, item.quantity, item.price]
            );
            if (orderStatus !== 'pending') {
                const stockUpdate = await client.query(
                    "UPDATE products SET stock = stock - $1 WHERE product_id = $2 AND stock >= $1",
                    [item.quantity, item.product_id]
                );
                if (stockUpdate.rowCount === 0) throw new Error(`Insufficient stock for Product ID: ${item.product_id}`);
            }
        }

        await client.query(
            `INSERT INTO payments (order_id, payment_method, amount, amount_received, change_amount, payment_status, transaction_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [orderId, paymentMethod || 'cash', actualPaid, actualPaid, change_amount || 0, pStatus, transactionId || null]
        );

        await client.query('COMMIT');
        const fullOrder = await getOrderDetails(client, orderId);
        return NextResponse.json({ success: true, message: 'Order placed successfully', payload: fullOrder }, { status: 201 });

    } catch (error) {
        if (client) await client.query('ROLLBACK');
        console.error("Order Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}

// ─── PUT — Lifecycle actions ───────────────────────────────────────────────────
export async function PUT(req) {
    const client = await pool.connect();
    try {
        const { orderId, action, amountReceived, changeAmount } = await req.json();
        await client.query('BEGIN');

        const currentOrder = await client.query(
            "SELECT status FROM orders WHERE order_id = $1",
            [orderId]
        );
        if (currentOrder.rowCount === 0) throw new Error("Order not found");
        const orderStatus = currentOrder.rows[0].status;

        // ── CONFIRM: pending → confirmed, deduct stock, update payment ────
        if (action === 'confirm') {
            if (orderStatus !== 'pending' && orderStatus !== 'confirmed' && orderStatus !== 'shipped') {
                throw new Error(`Cannot confirm an order with status: ${orderStatus}`);
            }

            // Deduct stock only if moving from pending to confirmed
            if (orderStatus === 'pending') {
                const items = await client.query(
                    "SELECT product_id, quantity FROM order_items WHERE order_id = $1",
                    [orderId]
                );
                for (const item of items.rows) {
                    const update = await client.query(
                        "UPDATE products SET stock = stock - $1 WHERE product_id = $2 AND stock >= $1",
                        [item.quantity, item.product_id]
                    );
                    if (update.rowCount === 0) throw new Error("Insufficient stock to confirm order");
                }
            }

            const orderData = await client.query("SELECT total_amount, due_amount FROM orders WHERE order_id = $1", [orderId]);
            const total = orderData.rows[0].total_amount;
            const currentDue = orderData.rows[0].due_amount;

            let newDue = currentDue;
            // Only update payment if amountReceived is explicitly provided
            if (amountReceived !== undefined && amountReceived !== null) {
                const actualPaid = (parseFloat(amountReceived) || 0) - (parseFloat(changeAmount) || 0);
                newDue = Math.max(0, parseFloat(total) - actualPaid);
                const pStatus = newDue <= 0 ? 'success' : 'partial';

                await client.query(
                    `UPDATE payments SET 
                        payment_status = $1, 
                        amount = $2, 
                        amount_received = $3, 
                        change_amount = $4,
                        paid_at = NOW() 
                     WHERE order_id = $5`,
                    [pStatus, actualPaid, amountReceived || 0, changeAmount || 0, orderId]
                );
            }

            await client.query(
                "UPDATE orders SET status = 'confirmed', due_amount = $1 WHERE order_id = $2",
                [newDue, orderId]
            );
            await client.query('COMMIT');
            const fullOrder = await getOrderDetails(client, orderId);
            return NextResponse.json({ success: true, message: 'Order confirmed successfully', payload: fullOrder });
        }

        // ── DIRECT DELIVER: pending/confirmed → delivered ─────────────────────────────────────
        if (action === 'direct_deliver') {
            if (orderStatus !== 'pending' && orderStatus !== 'confirmed') {
                throw new Error(`Cannot direct deliver an order with status: ${orderStatus}`);
            }

            // Deduct stock only if moving from pending
            if (orderStatus === 'pending') {
                const items = await client.query(
                    "SELECT product_id, quantity FROM order_items WHERE order_id = $1",
                    [orderId]
                );
                for (const item of items.rows) {
                    const update = await client.query(
                        "UPDATE products SET stock = stock - $1 WHERE product_id = $2 AND stock >= $1",
                        [item.quantity, item.product_id]
                    );
                    if (update.rowCount === 0) throw new Error("Insufficient stock to deliver order");
                }
            }
            await client.query(
                "UPDATE orders SET status = 'delivered', due_amount = 0 WHERE order_id = $1",
                [orderId]
            );
            await client.query(
                `UPDATE payments p 
                 SET payment_status = 'success', amount = o.total_amount, amount_received = o.total_amount, change_amount = 0, paid_at = NOW() 
                 FROM orders o 
                 WHERE p.order_id = o.order_id AND p.order_id = $1`,
                [orderId]
            );
            await client.query('COMMIT');
            const fullOrder = await getOrderDetails(client, orderId);
            return NextResponse.json({ success: true, message: 'Order delivered directly', payload: fullOrder });
        }

        // ── SHIP: confirmed → shipped ────────────────────────────────────────
        if (action === 'ship') {
            if (orderStatus !== 'confirmed') throw new Error(`Cannot ship an order with status: ${orderStatus}`);
            await client.query(
                "UPDATE orders SET status = 'shipped' WHERE order_id = $1",
                [orderId]
            );
            await client.query('COMMIT');
            return NextResponse.json({ success: true, message: 'Order marked as shipped' });
        }

        // ── DELIVER: shipped/confirmed → delivered ─────────────────────────────────────
        if (action === 'deliver') {
            if (orderStatus !== 'shipped' && orderStatus !== 'confirmed') {
                throw new Error(`Cannot deliver an order with status: ${orderStatus}. It must be confirmed or shipped first.`);
            }
            await client.query(
                "UPDATE orders SET status = 'delivered', due_amount = 0 WHERE order_id = $1",
                [orderId]
            );
            await client.query(
                `UPDATE payments p 
                 SET payment_status = 'success', amount = o.total_amount, amount_received = o.total_amount, change_amount = 0, paid_at = NOW() 
                 FROM orders o 
                 WHERE p.order_id = o.order_id AND p.order_id = $1`,
                [orderId]
            );
            await client.query('COMMIT');
            const fullOrder = await getOrderDetails(client, orderId);
            return NextResponse.json({ success: true, message: 'Order marked as delivered & payment completed', payload: fullOrder });
        }

        // ── CANCEL: pending or confirmed → cancelled ─────────────────────────
        if (action === 'cancel') {
            if (!['pending', 'confirmed'].includes(orderStatus)) throw new Error(`Cannot cancel an order with status: ${orderStatus}`);
            // Restore stock if it was already deducted (confirmed)
            if (orderStatus === 'confirmed') {
                const items = await client.query(
                    "SELECT product_id, quantity FROM order_items WHERE order_id = $1",
                    [orderId]
                );
                for (const item of items.rows) {
                    await client.query(
                        "UPDATE products SET stock = stock + $1 WHERE product_id = $2",
                        [item.quantity, item.product_id]
                    );
                }
            }
            await client.query(
                "UPDATE orders SET status = 'cancelled' WHERE order_id = $1",
                [orderId]
            );
            await client.query('COMMIT');
            return NextResponse.json({ success: true, message: 'Order cancelled' });
        }

        // ── RETURN: shipped/delivered → returned, restore stock, refund ──────────────
        if (action === 'return') {
            if (orderStatus === 'returned') throw new Error("Order already returned");
            if (orderStatus !== 'delivered' && orderStatus !== 'shipped') {
                throw new Error(`Cannot return an order with status: ${orderStatus}`);
            }

            const items = await client.query(
                "SELECT product_id, quantity FROM order_items WHERE order_id = $1",
                [orderId]
            );
            for (const item of items.rows) {
                await client.query(
                    "UPDATE products SET stock = stock + $1 WHERE product_id = $2",
                    [item.quantity, item.product_id]
                );
            }
            await client.query(
                "UPDATE orders SET status = 'returned' WHERE order_id = $1",
                [orderId]
            );
            await client.query(
                "UPDATE payments SET payment_status = 'refunded' WHERE order_id = $1",
                [orderId]
            );
            await client.query('COMMIT');
            return NextResponse.json({ success: true, message: "Order returned & stock restored" });
        }

        // ── DELETE: hard delete, restore stock if necessary ──────────────────
        if (action === 'delete') {
            if (['confirmed', 'shipped', 'delivered'].includes(orderStatus)) {
                const items = await client.query(
                    "SELECT product_id, quantity FROM order_items WHERE order_id = $1",
                    [orderId]
                );
                for (const item of items.rows) {
                    await client.query(
                        "UPDATE products SET stock = stock + $1 WHERE product_id = $2",
                        [item.quantity, item.product_id]
                    );
                }
            }
            await client.query("DELETE FROM order_items WHERE order_id = $1", [orderId]);
            await client.query("DELETE FROM payments WHERE order_id = $1", [orderId]);
            await client.query("DELETE FROM orders WHERE order_id = $1", [orderId]);
            await client.query('COMMIT');
            return NextResponse.json({ success: true, message: "Order deleted successfully" });
        }

        throw new Error("Invalid action provided");

    } catch (error) {
        await client.query('ROLLBACK');
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    } finally {
        client.release();
    }
}

// ─── GET — All orders (dashboard list) ────────────────────────────────────────
export async function GET() {
    const client = await pool.connect();
    try {
        const query = `
            SELECT 
                o.order_id, c.name, c.phone, o.shipping_address, o.delivery_charge, o.note,
                o.total_amount, o.due_amount, o.total_discount_amount AS discount,
                o.subtotal_amount AS subtotal, o.status,
                p.payment_status, p.payment_method, o.created_at AS date,
                JSON_AGG(JSON_BUILD_OBJECT('name', pr.name, 'quantity', oi.quantity, 'price', oi.price)) AS product_list,
                SUM(oi.quantity) AS total_items_count
            FROM orders o
            JOIN customers c    ON o.customer_id = c.customer_id
            JOIN payments p     ON o.order_id    = p.order_id
            JOIN order_items oi ON o.order_id    = oi.order_id
            JOIN products pr    ON oi.product_id = pr.product_id
            GROUP BY o.order_id, c.name, c.phone, o.total_amount, o.due_amount, p.payment_status, p.payment_method, o.created_at, o.shipping_address, o.delivery_charge, o.note
            ORDER BY o.created_at DESC
        `;
        const data = await client.query(query);
        if (data.rows.length === 0) return NextResponse.json({ success: false, message: 'No history found' }, { status: 404 });
        return NextResponse.json({ success: true, message: 'Successfully fetched data', payload: data.rows }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}