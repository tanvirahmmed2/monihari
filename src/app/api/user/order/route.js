import { pool } from "@/lib/database/db";
import { NextResponse } from "next/server";
import { isUserLogin } from "@/lib/middleware";

export async function GET() {
    const client = await pool.connect();
    try {
        // 1. Verify Authentication
        const auth = await isUserLogin();
        if (!auth.success) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const userPhone = auth.payload.phone;

        // 2. Fetch Customer ID using the phone from the logged-in user
        const customerRes = await client.query(
            "SELECT customer_id FROM customers WHERE phone = $1", 
            [userPhone]
        );

        if (customerRes.rowCount === 0) {
            return NextResponse.json({ success: false, message: "No customer profile found" }, { status: 404 });
        }

        const customerId = customerRes.rows[0].customer_id;

        // 3. Deep Query using your specific table structure
        const query = `
            SELECT 
                o.order_id, 
                o.total_amount, 
                o.status AS order_status, 
                o.created_at,
                p.payment_status,
                p.payment_method,
                p.transaction_id,
                oi.quantity,
                oi.price AS unit_price,
                pr.name AS product_name,
                pr.image AS product_image,
                pr.unit
            FROM orders o
            LEFT JOIN payments p ON o.order_id = p.order_id
            LEFT JOIN order_items oi ON o.order_id = oi.order_id
            LEFT JOIN products pr ON oi.product_id = pr.product_id
            WHERE o.customer_id = $1
            ORDER BY o.created_at DESC;
        `;

        const result = await client.query(query, [customerId]);

        // 4. Transform Data: Group items under their respective orders
        const ordersMap = {};

        result.rows.forEach(row => {
            if (!ordersMap[row.order_id]) {
                ordersMap[row.order_id] = {
                    order_id: row.order_id,
                    total_amount: row.total_amount,
                    order_status: row.order_status,
                    created_at: row.created_at,
                    payment: {
                        status: row.payment_status || 'unpaid',
                        method: row.payment_method || 'N/A',
                        transaction_id: row.transaction_id || ''
                    },
                    items: []
                };
            }
            
            if (row.product_name) {
                ordersMap[row.order_id].items.push({
                    name: row.product_name,
                    image: row.product_image,
                    quantity: row.quantity,
                    price: row.unit_price,
                    unit: row.unit
                });
            }
        });

        return NextResponse.json({
            success: true,
            payload: Object.values(ordersMap)
        }, { status: 200 });

    } catch (error) {
        console.error("Order Fetch Error:", error.message);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}