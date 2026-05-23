import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DB || process.env.PG_DATABASE,
  ssl: { rejectUnauthorized: false },
});

const sql = `
  CREATE TABLE IF NOT EXISTS product_variants (
    variant_id   SERIAL PRIMARY KEY,
    product_id   INT REFERENCES products(product_id) ON DELETE CASCADE,
    variant_name VARCHAR(150) NOT NULL,
    price        NUMERIC(10,2) NOT NULL,
    stock        INT DEFAULT 0
  );

  ALTER TABLE order_items    ADD COLUMN IF NOT EXISTS variant_id INT REFERENCES product_variants(variant_id) ON DELETE SET NULL;
  ALTER TABLE purchase_items ADD COLUMN IF NOT EXISTS variant_id INT REFERENCES product_variants(variant_id) ON DELETE SET NULL;
  ALTER TABLE inventory_logs ADD COLUMN IF NOT EXISTS variant_id INT REFERENCES product_variants(variant_id) ON DELETE SET NULL;
`;

try {
  await pool.query(sql);
  console.log('✅  Migration complete: product_variants table created and columns added.');
} catch (err) {
  console.error('❌  Migration failed:', err.message);
} finally {
  await pool.end();
}
