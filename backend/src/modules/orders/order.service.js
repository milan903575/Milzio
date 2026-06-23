import pool from '../../config/db.js';
import orderRepository from './order.repository.js';
import cartService from '../carts/cart.service.js';
import cartRepository from '../carts/cart.repository.js';

async function createOrder(userId) {

  const cart = await cartService.getCart(userId);
  const cartItems = cart.items;

  if (!cartItems || cartItems.length === 0) {
    throw { status: 400, message: 'Your cart is empty' };
  }

  for (const item of cartItems) {
    if (item.stock < item.quantity) {
      throw {
        status: 400,
        message: `"${item.name}" only has ${item.stock} units left. Please update your cart.`,
      };
    }
  }

  const total_cents = cartItems.reduce(
    (sum, item) => sum + item.price_cents * item.quantity,
    0
  );

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const order = await orderRepository.insertOrder(userId, total_cents, client);

    for (const item of cartItems) {
      await orderRepository.insertOrderItem(order.id, item, client);
    }

    const cartRow = await cartRepository.getOrCreateCart(userId);
    await cartRepository.clearCart(cartRow.id, client);

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
  return await orderRepository.getOrdersByUser(userId);
}

async function getOrderById(orderId, userId) {
  const order = await orderRepository.getOrderById(orderId, userId);

  if (!order) {
    throw { status: 404, message: 'Order not found' };
  }

  return order;
}

const orderService = {
  createOrder,
  getUserOrders,
  getOrderById,
};

export default orderService;