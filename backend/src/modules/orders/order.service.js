import pool from '../../config/db.js';
import orderRepository from './order.repository.js';
import cartRepository from '../carts/cart.repository.js';
import AppError from '../../utils/app.error.js';

async function createOrder(userId) {
  const cartItems = await cartRepository.getCartItemsByUserId(userId);

  if (!cartItems || cartItems.length === 0) {
    throw new AppError('Your cart is empty', 400);
  }

  for (const item of cartItems) {
    if (item.stock < item.quantity) {
      throw new AppError(
        `"${item.name}" only has ${item.stock} units left. Please update your cart.`,
        400
      );
    }
  }

  const total_cents = cartItems.reduce(
    (sum, item) => sum + item.price_cents * item.quantity,
    0
  );

  const existingOrder = await orderRepository.getReusablePendingOrder(
    userId,
    total_cents
  );

  if (existingOrder) {
    return existingOrder;
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const order = await orderRepository.insertOrder(userId, total_cents, client);

    for (const item of cartItems) {
      await orderRepository.insertOrderItem(order.id, item, client);
    }

    await client.query('COMMIT');
    return order;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function getUserOrders(userId) {
  const orders = await orderRepository.getOrdersByUser(userId);

  const ordersWithItems = await Promise.all(
    orders.map((order) => orderRepository.getOrderById(order.id, userId))
  );

  return ordersWithItems;
}

async function getOrderById(orderId, userId) {
  const order = await orderRepository.getOrderById(orderId, userId);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  return order;
}

const orderService = {
  createOrder,
  getUserOrders,
  getOrderById,
};

export default orderService;