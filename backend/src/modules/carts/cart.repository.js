import pool from '../../config/db.js';

async function getOrCreateCart(userId) {
  const existing = await pool.query(
    `SELECT id FROM carts WHERE user_id = $1 LIMIT 1`,
    [userId]
  );

  if (existing.rows.length > 0) return existing.rows[0];

  const created = await pool.query(
    `INSERT INTO carts (user_id) VALUES ($1) RETURNING id`,
    [userId]
  );

  return created.rows[0];
}

async function getCartItemsByUserId(userId) {
  const cart = await getOrCreateCart(userId);

  const result = await pool.query(
    `SELECT
      ci.id AS item_id,
      ci.quantity,
      p.id AS product_id,
      p.name,
      p.brand,
      p.category,
      p.price_cents,
      p.original_price_cents,
      p.image,
      p.stock,
      p.rating_stars
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.cart_id = $1
     ORDER BY ci.id ASC`,
    [cart.id]
  );

  return result.rows;
}

async function getCartItem(itemId, cartId) {
  const result = await pool.query(
    `SELECT id, quantity, product_id
     FROM cart_items
     WHERE id = $1 AND cart_id = $2
     LIMIT 1`,
    [itemId, cartId]
  );

  return result.rows[0] || null;
}

async function getCartItemByProduct(cartId, productId) {
  const result = await pool.query(
    `SELECT id, quantity
     FROM cart_items
     WHERE cart_id = $1 AND product_id = $2
     LIMIT 1`,
    [cartId, productId]
  );

  return result.rows[0] || null;
}

async function addCartItem(cartId, productId, quantity) {
  const result = await pool.query(
    `INSERT INTO cart_items (cart_id, product_id, quantity)
     VALUES ($1, $2, $3)
     RETURNING id, product_id, quantity`,
    [cartId, productId, quantity]
  );

  return result.rows[0];
}

async function updateCartItemQuantity(itemId, quantity) {
  const result = await pool.query(
    `UPDATE cart_items
     SET quantity = $1
     WHERE id = $2
     RETURNING id, product_id, quantity`,
    [quantity, itemId]
  );

  return result.rows[0] || null;
}

async function removeCartItem(itemId, cartId) {
  const result = await pool.query(
    `DELETE FROM cart_items
     WHERE id = $1 AND cart_id = $2
     RETURNING id`,
    [itemId, cartId]
  );

  return result.rows[0] || null;
}

async function clearCart(cartId, client = pool) {
  await client.query(
    `DELETE FROM cart_items WHERE cart_id = $1`,
    [cartId]
  );
}

const cartRepository = {
  getOrCreateCart,
  getCartItemsByUserId,
  getCartItem,
  getCartItemByProduct,
  addCartItem,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
};

export default cartRepository;