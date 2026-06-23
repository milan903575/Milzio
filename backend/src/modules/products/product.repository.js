import pool from '../../config/db.js';

function parseProduct(row) {
  return {
    ...row,
    keywords: Array.isArray(row.keywords)
      ? row.keywords
      : JSON.parse(row.keywords || '[]'),
  };
}

async function getAllProducts() {
  const query = `
    SELECT
      id,
      name,
      brand,
      description,
      image,
      category,
      price_cents,
      original_price_cents,
      rating_stars,
      rating_count,
      stock,
      keywords
    FROM products
    ORDER BY id DESC
  `;

  const result = await pool.query(query);
  return result.rows.map(parseProduct);
}

async function getProducts(filters = {}) {
  const {
    id,
    name,
    brand,
    category,
    minPrice,
    maxPrice,
    keywords,
  } = filters;

  let query = `
    SELECT
      id,
      name,
      description,
      brand,
      category,
      price_cents,
      original_price_cents,
      rating_stars,
      rating_count,
      stock,
      keywords
    FROM products
    WHERE stock > 0
  `;

  const values = [];
  let index = 1;

  if (id) {
    query += ` AND id = $${index++}`;
    values.push(id);
  }

  if (name) {
    query += ` AND name ILIKE $${index++}`;
    values.push(`%${name}%`);
  }

  if (brand) {
    query += ` AND brand ILIKE $${index++}`;
    values.push(brand);
  }

  if (category) {
    query += ` AND category ILIKE $${index++}`;
    values.push(category);
  }

  if (minPrice) {
    query += ` AND price_cents >= $${index++}`;
    values.push(Number(minPrice) * 100);
  }

  if (maxPrice) {
    query += ` AND price_cents <= $${index++}`;
    values.push(Number(maxPrice) * 100);
  }

  if (keywords) {
    query += ` AND (name ILIKE $${index} OR keywords ILIKE $${index + 1})`;
    values.push(`%${keywords}%`, `%${keywords}%`);
    index += 2;
  }

  query += ` ORDER BY id DESC LIMIT 5`;

  const result = await pool.query(query, values);
  return result.rows.map(parseProduct);
}

async function getProductById(id) {
  const query = `
    SELECT
      id,
      name,
      brand,
      description,
      image,
      category,
      price_cents,
      original_price_cents,
      rating_stars,
      rating_count,
      stock,
      keywords
    FROM products
    WHERE id = $1
    LIMIT 1
  `;

  const result = await pool.query(query, [id]);
  if (result.rows.length === 0) return null;

  return parseProduct(result.rows[0]);
}

async function createProduct(data) {
  const query = `
    INSERT INTO products (
      name,
      brand,
      description,
      image,
      category,
      price_cents,
      original_price_cents,
      rating_stars,
      rating_count,
      stock,
      keywords
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING
      id,
      name,
      brand,
      description,
      image,
      category,
      price_cents,
      original_price_cents,
      rating_stars,
      rating_count,
      stock,
      keywords
  `;

  const values = [
    data.name,
    data.brand,
    data.description,
    data.image,
    data.category,
    data.price_cents,
    data.original_price_cents,
    data.rating_stars ?? 0,
    data.rating_count ?? 0,
    data.stock ?? 0,
    JSON.stringify(data.keywords ?? []),
  ];

  const result = await pool.query(query, values);
  return parseProduct(result.rows[0]);
}

async function reduceStock(productId, quantity, client = pool) {
  const result = await client.query(
    `UPDATE products
     SET stock = stock - $1
     WHERE id = $2
       AND stock >= $1
     RETURNING id, stock`,
    [quantity, productId]
  );

  return result.rows[0] || null;
}

const productRepository = {
  getAllProducts,
  getProducts,
  getProductById,
  createProduct,
  reduceStock,
};

export default productRepository;