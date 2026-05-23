import { pool } from "@/lib/database/db";
import { isUserLogin, isManager } from "@/lib/middleware";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type'); // 'approved' or 'pending'

        let query = "";
        let values = [];

        if (type === 'pending') {
            const auth = await isManager();
            if (!auth.success) return NextResponse.json(auth, { status: 401 });
            query = `
                SELECT r.*, u.name as user_name 
                FROM reviews r
                LEFT JOIN users u ON r.user_id = u.user_id
                WHERE r.is_approved = FALSE
                ORDER BY r.created_at DESC
            `;
        } else if (type === 'my') {
            const auth = await isUserLogin();
            if (!auth.success) return NextResponse.json(auth, { status: 401 });
            query = `
                SELECT * FROM reviews 
                WHERE user_id = $1
                LIMIT 1
            `;
            values.push(auth.payload.user_id);
        } else {
            // Default: Fetch approved reviews for homepage
            query = `
                SELECT r.*, u.name as user_name 
                FROM reviews r
                LEFT JOIN users u ON r.user_id = u.user_id
                WHERE r.is_approved = TRUE
                ORDER BY r.created_at DESC
            `;
        }

        const res = await pool.query(query, values);
        return NextResponse.json({ success: true, payload: res.rows });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const auth = await isUserLogin();
        if (!auth.success) return NextResponse.json(auth, { status: 401 });

        const { rating, title, comment } = await req.json();

        // Check if user already reviewed
        const check = await pool.query(
            "SELECT review_id FROM reviews WHERE user_id = $1",
            [auth.payload.user_id]
        );

        if (check.rows.length > 0) {
            return NextResponse.json({ success: false, message: "You have already submitted a review" }, { status: 400 });
        }

        const res = await pool.query(
            `INSERT INTO reviews (user_id, rating, title, comment, is_approved)
             VALUES ($1, $2, $3, $4, FALSE)
             RETURNING *`,
            [auth.payload.user_id, rating, title, comment]
        );

        return NextResponse.json({ success: true, message: "Review submitted and pending approval", payload: res.rows[0] });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const auth = await isManager();
        if (!auth.success) return NextResponse.json(auth, { status: 401 });

        const { review_id, is_approved } = await req.json();

        const res = await pool.query(
            "UPDATE reviews SET is_approved = $1, updated_at = now() WHERE review_id = $2 RETURNING *",
            [is_approved, review_id]
        );

        if (res.rows.length === 0) {
            return NextResponse.json({ success: false, message: "Review not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Review status updated", payload: res.rows[0] });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const auth = await isManager();
        if (!auth.success) return NextResponse.json(auth, { status: 401 });

        const { searchParams } = new URL(req.url);
        const review_id = searchParams.get('id');

        const res = await pool.query(
            "DELETE FROM reviews WHERE review_id = $1 RETURNING *",
            [review_id]
        );

        if (res.rows.length === 0) {
            return NextResponse.json({ success: false, message: "Review not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Review deleted successfully" });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
