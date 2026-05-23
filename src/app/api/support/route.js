import { pool } from "@/lib/database/db";

import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/database/brevo";

export async function POST(req) {
    try {
const { name, email, subject, message } = await req.json()

        if (!name || !email || !subject || !message) {
            return NextResponse.json({
                success: false, message: 'Please provide all information'
            }, { status: 400 })
        }

        const newSupport = await pool.query(
            `INSERT INTO supports (name, email, subject, message) VALUES ($1, $2, $3, $4) RETURNING *`, 
            [name, email, subject, message]
        );

        if (newSupport.rowCount === 0) {
            return NextResponse.json({
                success: false, message: 'Failed to send message'
            }, { status: 400 })
        }
        return NextResponse.json({
            success: true, message: 'Successfully sent message'
        }, { status: 200 })
    } catch (error) {
        return NextResponse.json({
            success: false, message: error.message
        }, { status: 500 })
    }
}

export async function GET() {
    try {
const data = await pool.query(`SELECT * FROM supports  ORDER BY created_at DESC`, [])
        const result = data.rows

        return NextResponse.json({
            success: true, message: 'Successfully fetched data', payload: result
        }, { status: 200 })

    } catch (error) {
        return NextResponse.json({
            success: false, message: error.message
        }, { status: 500 })
    }
}

export async function PUT(req) {
    try {
        const { email, name, subject, replyMessage } = await req.json();

        if (!email || !replyMessage) {
            return NextResponse.json({ success: false, message: 'Email and message are required' }, { status: 400 });
        }

        const emailResult = await sendEmail({
            toEmail: email,
            toName: name || 'Valued Customer',
            subject: `Re: ${subject || 'Support Ticket'}`,
            htmlContent: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2>Support Response</h2>
                    <p>Hello ${name || ''},</p>
                    <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        ${replyMessage.replace(/\n/g, '<br/>')}
                    </div>
                    <p>Best regards,<br/>Support Team</p>
                </div>
            `
        });

        if (emailResult.success) {
            return NextResponse.json({ success: true, message: 'Reply sent successfully' });
        } else {
            return NextResponse.json({ success: false, message: 'Failed to send email' }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
const { id } = await req.json()
        if (!id) {
            return NextResponse.json({
                success: false, message: 'ID not received'
            }, { status: 400 })
        }
        const result = await pool.query(`DELETE FROM supports WHERE support_id = $1 RETURNING *`, [id])
        if (result.rowCount === 0) {
            return NextResponse.json({
                success: false, message: 'Failed to remove message'
            }, { status: 400 })
        }

        return NextResponse.json({
            success: true, message: 'Successfully deleted message'
        }, { status: 200 })
    } catch (error) {
        return NextResponse.json({
            success: false, message: error.message
        }, { status: 500 })
    }
}