import pool from '../../config/db.js';

async function insertOrder(userId, total_cents, client = pool) {
  const result = await client.query(
    `INSERT INTO orders (user_id, total_cents, status)
     VALUES ($1, $2, 'pending')
     RETURNING id, user_id, total_cents, status, created_at`,
    [userId, total_cents]
  );

  return result.rows[0];
}

async function insertOrderItem(orderId, item, client = pool) {
  await client.query(
    `INSERT INTO order_items (order_id, product_id, name, brand, price_cents, quantity)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [orderId, item.product_id, item.name, item.brand, item.price_cents, item.quantity]
  );
}

async function getOrdersByUser(userId) {
  const result = await pool.query(
    `SELECT id, total_cents, status, created_at
     FROM orders
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );

  return result.rows;
}

async function getOrderById(orderId, userId) {
  const orderResult = await pool.query(
    `SELECT id, total_cents, status, created_at
     FROM orders
     WHERE id = $1 AND user_id = $2
     LIMIT 1`,
    [orderId, userId]
  );

  const order = orderResult.rows[0] || null;
  if (!order) return null;

  const itemsResult = await pool.query(
    `SELECT id, product_id, name, brand, price_cents, quantity
     FROM order_items
     WHERE order_id = $1
     ORDER BY id ASC`,
    [orderId]
  );

  return { ...order, items: itemsResult.rows };
}

async function updateOrderStatus(orderId, status, client = pool) {
  const result = await client.query(
    `UPDATE orders
     SET status = $1
     WHERE id = $2
     RETURNING id, status`,
    [status, orderId]
  );

  return result.rows[0] || null;
}

const orderRepository = {
  insertOrder,
  insertOrderItem,
  getOrdersByUser,
  getOrderById,
  updateOrderStatus,
};

export default orderRepository;