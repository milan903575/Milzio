const db = require('../../config/db');

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


module.exports = {
  getAllProducts,
  getProductById,
  createProduct
};
