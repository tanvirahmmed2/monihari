import { pool } from "@/lib/database/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const query = `
      SELECT s.supplier_id, s.name, s.phone, s.email, s.address,
             COUNT(p.purchase_id) AS total_purchases,
             COALESCE(SUM(p.total_amount), 0) AS total_amount_spent,
             MAX(p.created_at) AS last_purchase_date
      FROM suppliers s
      LEFT JOIN purchases p ON s.phone = p.supplier_phone
      GROUP BY s.supplier_id, s.name, s.phone, s.email, s.address
      ORDER BY total_amount_spent DESC`;
    const data = await pool.query(query);
    return NextResponse.json({ success: true, payload: data.rows }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { name, phone, email, address } = await req.json();
    if (!name || !phone) return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    
    const check = await pool.query("SELECT supplier_id FROM suppliers WHERE phone = $1", [phone]);
    if (check.rows.length > 0) return NextResponse.json({ success: false, message: "Phone number already exists" }, { status: 400 });
    
    const query = "INSERT INTO suppliers (name, phone, email, address) VALUES ($1, $2, $3, $4) RETURNING *";
    const res = await pool.query(query, [name, phone, email || null, address || null]);
    return NextResponse.json({ success: true, message: "Supplier added", payload: res.rows[0] }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
    
    const res = await pool.query("DELETE FROM suppliers WHERE supplier_id = $1 RETURNING *", [id]);
    if (res.rowCount === 0) return NextResponse.json({ success: false, message: "Supplier not found" }, { status: 404 });
    return NextResponse.json({ success: true, message: "Supplier deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}