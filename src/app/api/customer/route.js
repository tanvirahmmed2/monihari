import { pool } from "@/lib/database/db";

import { NextResponse } from "next/server";

// GET: Fetch all customers
export async function GET() {
    const client = await pool.connect();
    try {
const result = await client.query(`
            SELECT * FROM customers 
            
            ORDER BY created_at DESC
        `, []);
        
        return NextResponse.json({
            success: true,
            payload: result.rows
        }, { status: 200 });

    } catch (error) {
        console.error("Fetch Customers Error:", error);
        return NextResponse.json({ 
            success: false, 
            message: "Internal server error" 
        }, { status: 500 });
    } finally {
        client.release();
    }
}

// POST: Create a new customer
export async function POST(req) {
    const client = await pool.connect();
    try {
const body = await req.json();
        const { name, phone, email, address } = body;

        // 1. Basic Validation
        if (!name || !phone) {
            return NextResponse.json({ 
                success: false, 
                message: "Name and Phone are required" 
            }, { status: 400 });
        }

        // 2. Check if phone already exists (unique constraint check)
        const checkExist = await client.query(
            "SELECT customer_id FROM customers WHERE phone = $1", 
            [phone]
        );

        if (checkExist.rowCount > 0) {
            return NextResponse.json({ 
                success: false, 
                message: "A customer with this phone number already exists" 
            }, { status: 400 });
        }

        // 3. Insert into Database
        const query = `
            INSERT INTO customers (name, phone, email, address) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *
        `;
        const values = [name, phone, email || null, address || null];
        const result = await client.query(query, values);

        return NextResponse.json({
            success: true,
            message: "Customer added successfully",
            payload: result.rows[0]
        }, { status: 201 });

    } catch (error) {
        console.error("Create Customer Error:", error);
        return NextResponse.json({ 
            success: false, 
            message: "Failed to create customer: " + error.message 
        }, { status: 500 });
    } finally {
        client.release();
    }
}