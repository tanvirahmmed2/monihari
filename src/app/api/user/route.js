import { pool } from "@/lib/database/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        const { name, email, phone, password, role } = await req.json();

        if (!name || !email || !phone || !password) {
            return NextResponse.json({ message: "All fields are required" }, { status: 400 });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const client = await pool.connect();
        try {
            const query = `
                INSERT INTO users (name, email, phone, password, role)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING user_id, name, email, role;
            `;
            const values = [name, email, phone, hashedPassword, role || 'user'];
            const result = await client.query(query, values);

            // SYNC CUSTOMER NAME: If a customer exists with this phone, update their name
            await client.query(
                "UPDATE customers SET name = $1 WHERE phone = $2",
                [name, phone]
            );

            return NextResponse.json({
                success: true,
                message: "User registered successfully",
                payload: result.rows[0]
            }, { status: 201 });

        } catch (err) {
            if (err.code === '23505') { 
                return NextResponse.json({ success: false, message: "Email or Phone already exists" }, { status: 409 });
            }
            throw err;
        } finally {
            client.release();
        }
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const res = await pool.query(
            `SELECT user_id, name, email, phone, role, is_active, created_at 
             FROM users 
             ORDER BY created_at DESC`
        );

        return NextResponse.json({
            success: true,
            message: "Successfully fetched users",
            payload: res.rows
        });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const { user_id, name, phone, email, password, role, is_active } = await req.json();
        const client = await pool.connect();

        try {
            let query;
            let values;

            if (password) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                query = `
                    UPDATE users 
                    SET name = $1, phone = $2, email = $3, password = $4, role = $5, is_active = $6
                    WHERE user_id = $7
                    RETURNING user_id, name, email, phone, role;
                `;
                values = [name, phone, email, hashedPassword, role, is_active, user_id];
            } else {
                query = `
                    UPDATE users 
                    SET name = $1, phone = $2, email = $3, role = $4, is_active = $5
                    WHERE user_id = $6
                    RETURNING user_id, name, email, phone, role;
                `;
                values = [name, phone, email, role, is_active, user_id];
            }

            const result = await client.query(query, values);

            if (result.rowCount === 0) {
                return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
            }

            return NextResponse.json({ success: true, message: "User updated", payload: result.rows[0] });
        } finally {
            client.release();
        }
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const { id } = await req.json();

        const result = await pool.query("DELETE FROM users WHERE user_id = $1", [id]);
        
        if (result.rowCount === 0) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Account deleted successfully" });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const { email, role } = await req.json();

        if (!email || !role) {
            return NextResponse.json({ success: false, message: "Email and Role are required" }, { status: 400 });
        }

        const res = await pool.query(
            `UPDATE users 
             SET role = $1 
             WHERE email = $2 
             RETURNING user_id, name, email, role`, 
            [role, email]
        );

        if (res.rowCount === 0) {
            return NextResponse.json({ success: false, message: "User with this email not found in your store" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: `User promoted to ${role} successfully`,
            payload: res.rows[0]
        });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}