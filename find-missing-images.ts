import { Pool } from '@neondatabase/serverless';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const result = await pool.query(`
    SELECT p.id, p.name, p.img
    FROM products p
    LEFT JOIN product_images pi ON pi.product_id = p.id
    WHERE pi.id IS NULL
    AND p."isActive" = true
    ORDER BY p.id
  `);
  
  console.log('Total missing:', result.rows.length);
  for (const r of result.rows) {
    console.log(JSON.stringify({id: r.id, name: r.name, img: r.img}));
  }
  await pool.end();
}
main();
