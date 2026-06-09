import db from '../../config/db.js';

function getAllProducts() {
  const stmt = db.prepare(`
    SELECT id, name, brand, description, image, category,
           price_cents, original_price_cents,
           rating_stars, rating_count, stock, keywords
    FROM products
  `);
  const rows = stmt.all();
  return rows.map(row => ({
    ...row,
    keywords: JSON.parse(row.keywords || '[]')
  }));
}

function getProducts({ id, name, brand, category, minPrice, maxPrice, keywords } = {}) {
  let query = `SELECT id, name, brand, category, price_cents, original_price_cents, rating_stars, rating_count, stock, keywords
  FROM products
  WHERE stock > 0`;

  const params = [];

  if (id) {
    query += ` AND id = ?`;
    params.push(id);
  }

  if (name) {
    query += ` AND name LIKE ?`;
    params.push(`%${name}%`);
  }

  if (brand) {
    query += ` AND LOWER(brand) = LOWER(?)`;
    params.push(brand);
  }

  if (category) {
    query += ` AND LOWER(category) = LOWER(?)`;
    params.push(category);
  }

  if (minPrice) {
    query += ` AND price_cents >= ?`;
    params.push(Number(minPrice) * 100);
  }

  if (maxPrice) {
    query += ` AND price_cents <= ?`;
    params.push(Number(maxPrice) * 100);
  }

  if (keywords) {
    query += ` AND (LOWER(name) LIKE LOWER(?) OR LOWER(keywords) LIKE LOWER(?))`;
    params.push(`%${keywords}%`, `%${keywords}%`);
  }

  query += ` LIMIT 5`;

  const rows = db.prepare(query).all(...params);

  return rows.map((row) => ({
    ...row,
    keywords: JSON.parse(row.keywords || '[]'),
  }));
}

function getProductById(id) {
  const stmt = db.prepare(`
    SELECT id, name, brand, description, image, category,
           price_cents, original_price_cents,
           rating_stars, rating_count, stock, keywords
    FROM products
    WHERE id = ?
  `);
  const row = stmt.get(id);
  if (!row) return null;
  return {
    ...row,
    keywords: JSON.parse(row.keywords || '[]')
  };
}

function createProduct(data) {
  const stmt = db.prepare(`
    INSERT INTO products (name, brand, description, image, category, price_cents, original_price_cents, rating_stars, rating_count, stock, keywords)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(
    data.name,
    data.brand,
    data.description,
    data.image,
    data.category,
    data.price_cents,
    data.original_price_cents,
    data.rating_stars,
    data.rating_count,
    data.stock,
    JSON.stringify(data.keywords)
  );

}


const productRepository = {
  getAllProducts,
  getProducts,
  getProductById,
  createProduct
};

export default productRepository;