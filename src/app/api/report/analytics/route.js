import { pool } from "@/lib/database/db";

import { NextResponse } from "next/server";

export async function GET() {
    const client = await pool.connect();
    try {
const salesStatsQuery = `
            SELECT 
                COALESCE(SUM(CASE WHEN created_at::date = CURRENT_DATE THEN total_amount ELSE 0 END), 0)::FLOAT as today,
                COALESCE(SUM(CASE WHEN created_at::date = CURRENT_DATE - 1 THEN total_amount ELSE 0 END), 0)::FLOAT as yesterday,
                COALESCE(SUM(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN total_amount ELSE 0 END), 0)::FLOAT as last_week,
                COALESCE(SUM(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '1 year' THEN total_amount ELSE 0 END), 0)::FLOAT as last_year
            FROM orders WHERE status IN ('confirmed', 'shipped', 'delivered', 'completed', 'confirm');
        `;

        const financeQuery = `
            SELECT 
                (SELECT COALESCE(SUM(stock * purchase_price), 0)::FLOAT FROM products ) as stock_valuation,
                (SELECT COALESCE(SUM(total_amount), 0)::FLOAT FROM orders WHERE status IN ('confirmed', 'shipped', 'delivered', 'completed', 'confirm')) as total_sales,
                (SELECT COALESCE(SUM(total_amount), 0)::FLOAT FROM purchases ) as total_purchases_cost,
                (SELECT COALESCE(SUM(amount_paid), 0)::FLOAT FROM purchase_payments ) as cash_outflow
            FROM products  LIMIT 1;
        `;

        const chartQuery = `
            SELECT 
                to_char(d.day, 'DD Mon') as date,
                COALESCE(SUM(o.total_amount), 0)::FLOAT as amount,
                COALESCE((SELECT SUM(total_amount) FROM purchases WHERE created_at::date = d.day), 0)::FLOAT as purchase_amount
            FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day') d(day)
            LEFT JOIN orders o ON o.created_at::date = d.day AND o.status IN ('confirmed', 'shipped', 'delivered')
            GROUP BY d.day
            ORDER BY d.day ASC;
        `;

        const [sales, finance, chart] = await Promise.all([
            client.query(salesStatsQuery, []),
            client.query(financeQuery, []),
            client.query(chartQuery, [])
        ]);

        const stats = finance.rows[0];
        const netCashFlow = stats.total_sales - stats.cash_outflow;

        return NextResponse.json({
            success: true,
            payload: {
                sales: sales.rows[0],
                finance: {
                    total_invested: stats.total_purchases_cost, // Total ever spent on stock
                    total_earned: stats.total_sales,          // Total revenue
                    net_cash: netCashFlow,                    // Real pocket money
                    current_stock_value: stats.stock_valuation // Assets on hand
                },
                chartData: chart.rows
            }
        });
    } catch (error) {
        console.error("Advanced Analytics Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}