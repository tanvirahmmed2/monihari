import { pool } from "@/lib/database/db";
import { NextResponse } from "next/server";

// Normalize DB row → expose both short & prefixed field names so all consumers work
function normalize(row) {
    if (!row) return null;
    return {
        ...row,
        // Aliases so legacy readers like Footer.jsx (website_*) and print.js (name/phone/address) both work
        website_name:    row.name,
        website_email:   row.email,
        website_phone:   row.phone,
        website_address: row.address,
    };
}

export async function GET() {
    try {
        const res = await pool.query(`SELECT * FROM site_settings ORDER BY id LIMIT 1`);
        if (res.rows.length === 0) {
            return NextResponse.json({ success: true, payload: null }, { status: 200 });
        }
        return NextResponse.json({ success: true, payload: normalize(res.rows[0]) }, { status: 200 });
    } catch (error) {
        console.error("site-settings GET error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const body = await req.json();
        const {
            name, business_name, email, phone, address, city, country,
            logo, favicon, meta_title, meta_description,
            facebook, instagram, linkedin, youtube,
            primary_color, is_public, is_store_enabled
        } = body;

        // Upsert — always update the single row (id = 1)
        const res = await pool.query(`
            INSERT INTO site_settings 
                (id, name, business_name, email, phone, address, city, country, logo, favicon,
                 meta_title, meta_description, facebook, instagram, linkedin, youtube,
                 primary_color, is_public, is_store_enabled)
            VALUES 
                (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name, business_name = EXCLUDED.business_name,
                email = EXCLUDED.email, phone = EXCLUDED.phone, address = EXCLUDED.address,
                city = EXCLUDED.city, country = EXCLUDED.country, logo = EXCLUDED.logo,
                favicon = EXCLUDED.favicon, meta_title = EXCLUDED.meta_title,
                meta_description = EXCLUDED.meta_description, facebook = EXCLUDED.facebook,
                instagram = EXCLUDED.instagram, linkedin = EXCLUDED.linkedin,
                youtube = EXCLUDED.youtube, primary_color = EXCLUDED.primary_color,
                is_public = EXCLUDED.is_public, is_store_enabled = EXCLUDED.is_store_enabled
            RETURNING *
        `, [
            name, business_name, email, phone, address, city, country,
            logo, favicon, meta_title, meta_description,
            facebook, instagram, linkedin, youtube,
            primary_color ?? '#10b981',
            is_public ?? true,
            is_store_enabled ?? true
        ]);

        return NextResponse.json({ success: true, message: 'Settings saved', payload: normalize(res.rows[0]) });
    } catch (error) {
        console.error("site-settings PUT error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
