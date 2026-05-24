import cloudinary from "@/lib/database/cloudinary";
import { pool } from "@/lib/database/db";
import { NextResponse } from "next/server";
import slugify from "slugify";

export async function POST(req) {
    try {
        const formData = await req.formData();
        
        const name = formData.get("name");
        const description = formData.get('description');
        const category_id = parseInt(formData.get('categoryId') || formData.get('category_id'));
        const sub_category_id = null;
        const brand_id = (formData.get('brandId') || formData.get('brand_id')) ? parseInt(formData.get('brandId') || formData.get('brand_id')) : null;
        const unit = formData.get('unit');
        const stock = parseFloat(formData.get('stock')) || 0;
        const purchase_price = parseFloat(formData.get('purchasePrice') || formData.get('purchase_price')) || 0;
        const sale_price = parseFloat(formData.get('salePrice') || formData.get('sale_price')) || 0;
        const discount_price = parseFloat(formData.get('discountPrice') || formData.get('discount_price')) || 0;
        const wholesale_price = parseFloat(formData.get('wholeSalePrice') || formData.get('wholesale_price')) || 0;
        const retail_price = parseFloat(formData.get('retailPrice') || formData.get('retail_price')) || 0;
        const dealer_price = parseFloat(formData.get('dealerPrice') || formData.get('dealer_price')) || 0;
        const imageFile = formData.get('image');

        if (!name || !category_id || !unit || isNaN(purchase_price) || isNaN(sale_price)) {
            return NextResponse.json({ success: false, message: 'Please provide all required fields' }, { status: 400 });
        }

        let barcode = formData.get('barcode');
        if (!barcode || barcode.trim() === '') {
            const maxBarcodeResult = await pool.query(`
                SELECT MAX(CAST(barcode AS BIGINT)) as max_code 
                FROM products 
                WHERE barcode ~ '^[0-9]+$'
            `);
            const maxCode = maxBarcodeResult.rows[0]?.max_code;
            barcode = maxCode ? (Number(maxCode) + 1).toString() : "10001";
        }

        const computedStock = parseFloat(formData.get('stock')) || 0;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const slug = slugify(name.trim(), { lower: true, strict: true });

            const isExists = await client.query(
                `SELECT product_id FROM products WHERE (slug=$1 OR barcode=$2)`, 
                [slug, barcode]
            );
            if (isExists.rowCount > 0) {
                await client.query('ROLLBACK');
                return NextResponse.json({ success: false, message: 'Product name or Barcode already exists' }, { status: 400 });
            }

            if (!imageFile) {
                await client.query('ROLLBACK');
                return NextResponse.json({ success: false, message: 'Please add image' }, { status: 400 });
            }

            const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
            const cloudImage = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: `products` },
                    (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    }
                );
                stream.end(imageBuffer);
            });

            const query = `
                INSERT INTO products (
                    name, description, category_id, brand_id, slug, barcode, unit, 
                    stock, purchase_price, sale_price, discount_price, 
                    wholesale_price, retail_price, dealer_price, image, image_id
                ) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
                RETURNING product_id`;

            const values = [
                name, description, category_id, brand_id, slug, barcode, unit,
                computedStock, purchase_price, sale_price, discount_price,
                wholesale_price, retail_price, dealer_price, 
                cloudImage.secure_url, cloudImage.public_id
            ];

            const newProduct = await client.query(query, values);
            const productId = newProduct.rows[0].product_id;

            // Save variants if provided
            const variantsRaw = formData.get('variants');
            if (variantsRaw) {
                const variants = JSON.parse(variantsRaw);
                for (const v of variants) {
                    if (v.variant_name && v.price !== undefined) {
                        await client.query(
                            `INSERT INTO product_variants (product_id, variant_name, price, stock) VALUES ($1, $2, $3, $4)`,
                            [productId, v.variant_name, parseFloat(v.price), parseInt(v.stock) || 0]
                        );
                    }
                }
            }

            // Fetch the final product to return
            const finalProduct = await client.query(`
                SELECT p.*, c.name as category_name, b.name as brand_name 
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.category_id
                LEFT JOIN brands b ON p.brand_id = b.brand_id
                WHERE p.product_id = $1
            `, [productId]);

            const productToReturn = finalProduct.rows[0];
            const variantsRes = await client.query(`SELECT * FROM product_variants WHERE product_id = $1 ORDER BY variant_id ASC`, [productId]);
            productToReturn.variants = variantsRes.rows;

            await client.query('COMMIT');
            return NextResponse.json({
                success: true, 
                message: `Successfully added product. Barcode: ${barcode}`,
                payload: productToReturn
            }, { status: 201 });

        } catch (error) {
            await client.query('ROLLBACK');
            console.error("Product POST Transaction Error:", error);
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error("Product POST API Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = 20;
        const offset = (page - 1) * limit;

        const countRes = await pool.query("SELECT COUNT(*) FROM products");
        const totalItems = parseInt(countRes.rows[0].count);
        const totalPages = Math.ceil(totalItems / limit);

        const data = await pool.query(
            `SELECT 
                p.*
             FROM products p 
             ORDER BY p.created_at DESC 
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        const result = data.rows;

        if (!result || result.length === 0) {
            return NextResponse.json({
                success: false, 
                message: 'No product found'
            }, { status: 400 });
        }

        // Attach variants to each product
        const productIds = result.map(p => p.product_id);
        const variantsRes = await pool.query(
            `SELECT * FROM product_variants WHERE product_id = ANY($1) ORDER BY variant_id ASC`,
            [productIds]
        );
        const variantsByProduct = {};
        for (const v of variantsRes.rows) {
            if (!variantsByProduct[v.product_id]) variantsByProduct[v.product_id] = [];
            variantsByProduct[v.product_id].push(v);
        }
        for (const p of result) {
            p.variants = variantsByProduct[p.product_id] || [];
        }

        return NextResponse.json({
            success: true,
            message: 'Successfully fetched data',
            payload: result,
            pagination: {
                totalItems,
                totalPages,
                currentPage: page
            }
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({
            success: false, 
            message: error.message
        }, { status: 500 });
    }
}


export async function DELETE(req) {
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json(
                { success: false, message: "ID not received" },
                { status: 400 }
            );
        }

        const { rows } = await pool.query(`SELECT * FROM products WHERE product_id = $1`, [id]);
        if (rows.length === 0) {
            return NextResponse.json(
                { success: false, message: "No product found with this ID" },
                { status: 404 }
            );
        }

        const product = rows[0];

        const deleteImage = await cloudinary.uploader.destroy(product.image_id);
        if (deleteImage.result !== "ok" && deleteImage.result !== "not found") {
            return NextResponse.json(
                { success: false, message: "Could not delete image from Cloudinary" },
                { status: 500 }
            );
        }

        const deleteProduct = await pool.query(
            `DELETE FROM products WHERE product_id = $1 RETURNING *`,
            [id]
        );

        if (deleteProduct.rowCount === 0) {
            return NextResponse.json(
                { success: false, message: "Failed to delete product" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: true, message: "Successfully deleted product" },
            { status: 200 }
        );

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PUT(req) {
    const client = await pool.connect();
    try {
        const formData = await req.formData();
        const id = formData.get("id");
        const name = formData.get("name");

        if (!id) {
            return NextResponse.json({ success: false, message: 'Product ID is required' }, { status: 400 });
        }


        const description = formData.get('description');
        const category_id = parseInt(formData.get('categoryId') || formData.get('category_id'));
        const sub_category_id = null;
        const brand_id = (formData.get('brandId') || formData.get('brand_id')) ? parseInt(formData.get('brandId') || formData.get('brand_id')) : null;
        const barcode = formData.get('barcode');
        const unit = formData.get('unit');
        const stock = parseFloat(formData.get('stock')) || 0;
        const purchase_price = parseFloat(formData.get('purchasePrice') || formData.get('purchase_price')) || 0;
        const sale_price = parseFloat(formData.get('salePrice') || formData.get('sale_price')) || 0;
        const discount_price = parseFloat(formData.get('discountPrice') || formData.get('discount_price')) || 0;
        const wholesale_price = parseFloat(formData.get('wholeSalePrice') || formData.get('wholesale_price')) || 0;
        const retail_price = parseFloat(formData.get('retailPrice') || formData.get('retail_price')) || 0;
        const dealer_price = parseFloat(formData.get('dealerPrice') || formData.get('dealer_price')) || 0;
        
        const computedStock = parseFloat(formData.get('stock')) || 0;

        await client.query('BEGIN');

        const slug = name ? slugify(name.trim(), { lower: true, strict: true }) : null;

        const imageFile = formData.get("image");
        let imageUrl = null;
        let imagePublicId = null;

        if (imageFile && typeof imageFile !== 'string' && imageFile.size > 0) {
            const arrayBuffer = await imageFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const uploadResponse = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { folder: `products` },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                ).end(buffer);
            });

            imageUrl = uploadResponse.secure_url;
            imagePublicId = uploadResponse.public_id;
        }

        let query = `
            UPDATE products 
            SET 
                name = COALESCE($1, name), 
                description = $2, 
                category_id = $3, 
                brand_id = $4, 
                slug = COALESCE($5, slug), 
                barcode = $6, 
                unit = $7, 
                stock = $8, 
                purchase_price = $9, 
                sale_price = $10, 
                discount_price = $11, 
                wholesale_price = $12, 
                retail_price = $13, 
                dealer_price = $14
        `;

        const values = [
            name, description, category_id, brand_id, slug, barcode, unit,
            computedStock, purchase_price, sale_price, discount_price,
            wholesale_price, retail_price, dealer_price
        ];

        if (imageUrl) {
            query += `, image = $15, image_id = $16 WHERE product_id = $17`;
            values.push(imageUrl, imagePublicId, id);
        } else {
            query += ` WHERE product_id = $15`;
            values.push(id);
        }

        const updatedProduct = await client.query(query + " RETURNING *", values);

        if (updatedProduct.rowCount === 0) {
            await client.query('ROLLBACK');
            return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
        }

        // Sync variants if provided
        const variantsRaw = formData.get('variants');
        if (variantsRaw) {
            const variants = JSON.parse(variantsRaw);
            // Delete existing then re-insert
            await client.query(`DELETE FROM product_variants WHERE product_id = $1`, [id]);
            for (const v of variants) {
                if (v.variant_name && v.price !== undefined) {
                    await client.query(
                        `INSERT INTO product_variants (product_id, variant_name, price, stock) VALUES ($1, $2, $3, $4)`,
                        [id, v.variant_name, parseFloat(v.price), parseInt(v.stock) || 0]
                    );
                }
            }
        }

        // Fetch the final product to return
        const finalProduct = await client.query(`
            SELECT p.*, c.name as category_name, b.name as brand_name 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.category_id
            LEFT JOIN brands b ON p.brand_id = b.brand_id
            WHERE p.product_id = $1
        `, [id]);

        const productToReturn = finalProduct.rows[0];
        const variantsRes = await client.query(`SELECT * FROM product_variants WHERE product_id = $1 ORDER BY variant_id ASC`, [id]);
        productToReturn.variants = variantsRes.rows;

        await client.query('COMMIT');
        return NextResponse.json({
            success: true,
            message: 'Successfully updated product',
            payload: productToReturn
        }, { status: 200 });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Update Error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    } finally {
        client.release();
    }
}