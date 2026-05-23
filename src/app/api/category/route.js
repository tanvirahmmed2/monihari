import { pool } from '@/lib/database/db'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { name, parent_id } = await req.json()

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Please add category name' },
        { status: 400 }
      )
    }

    const parentId = parent_id ? parseInt(parent_id) : null;

    const existCat = await pool.query(
      'SELECT 1 FROM categories WHERE name = $1 AND (parent_id = $2 OR (parent_id IS NULL AND $2 IS NULL))',
      [name.trim(), parentId]
    )

    if (existCat.rowCount > 0) {
      return NextResponse.json(
        { success: false, message: 'Category already exists' },
        { status: 409 }
      )
    }

    const newCat = await pool.query(
      'INSERT INTO categories(name, parent_id) VALUES($1, $2) RETURNING *',
      [name.trim(), parentId]
    )

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully added category',
        data: newCat.rows[0],
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
    try {
        const data = await pool.query(
            'SELECT * FROM categories ORDER BY created_at DESC'
        )
        const result = data.rows

        if (!result || result.length === 0) {
            return NextResponse.json({
                success: false, message: 'No category found'
            }, { status: 400 })
        }

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
    const { id, name, parent_id } = await req.json();

    if (!id || !name) {
      return NextResponse.json(
        { success: false, message: 'ID and Name are required' },
        { status: 400 }
      );
    }

    const parentId = parent_id ? parseInt(parent_id) : null;

    const result = await pool.query(
      'UPDATE categories SET name = $1, parent_id = $2 WHERE category_id = $3 RETURNING *',
      [name.trim(), parentId, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Successfully updated category', data: result.rows[0] },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
    try {
        const { id } = await req.json()
        if (!id) {
            return NextResponse.json({
                success: false, message: 'ID not recieved'
            }, { status: 400 })
        }
        const result = await pool.query(
            `DELETE FROM categories WHERE category_id = $1 RETURNING *`, 
            [id]
        )

        if (result.rowCount === 0) {
            return NextResponse.json({
                success: false, message: 'Failed to delete category'
            }, { status: 400 })
        }

        return NextResponse.json({
            success: true, message: 'Successfully deleted category'
        }, { status: 200 })
        
    } catch (error) {
        return NextResponse.json({
            success: false, message: error.message
        }, { status: 500 })
    }
}