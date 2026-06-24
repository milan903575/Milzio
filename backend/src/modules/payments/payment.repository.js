// src/modules/payments/payment.repository.js

import pool from '../../config/db.js';
import orderRepository from '../orders/order.repository.js';
import productRepository from '../products/product.repository.js';
import cartRepository from '../carts/cart.repository.js';

async function createPaymentOrderRecord({
  orderId,
  userId,
  razorpayOrderId,
  amountCents,
}) {
  const result = await pool.query(
    `INSERT INTO payments (
      order_id,
      user_id,
      razorpay_order_id,
      amount_cents,
      status
    )
    VALUES ($1, $2, $3, $4, 'created')
    RETURNING id, order_id, user_id, razorpay_order_id, amount_cents, status, created_at`,
    [orderId, userId, razorpayOrderId, amountCents]
  );

  return result.rows[0];
}

async function getPaymentByRazorpayOrderId(razorpayOrderId) {
  const result = await pool.query(
    `SELECT
      id,
      order_id,
      user_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount_cents,
      status,
      created_at,
      paid_at
     FROM payments
     WHERE razorpay_order_id = $1
     LIMIT 1`,
    [razorpayOrderId]
  );

  return result.rows[0] || null;
}

async function updatePaymentAsPaid({
  paymentId,
  razorpayPaymentId,
  razorpaySignature,
  client = pool,
}) {
  const result = await client.query(
    `UPDATE payments
     SET razorpay_payment_id = $1,
         razorpay_signature = $2,
         status = 'paid',
         paid_at = NOW()
     WHERE id = $3
     RETURNING id, order_id, user_id, status, paid_at`,
    [razorpayPaymentId, razorpaySignature, paymentId]
  );

  return result.rows[0] || null;
}

async function markPaymentFailed(paymentId, client = pool) {
  const result = await client.query(
    `UPDATE payments
     SET status = 'failed'
     WHERE id = $1
     RETURNING id, status`,
    [paymentId]
  );

  return result.rows[0] || null;
}

async function finalizeSuccessfulPayment({
  payment,
  order,
  cartId,
  razorpayPaymentId,
  razorpaySignature,
}) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const paidPayment = await updatePaymentAsPaid({
      paymentId: payment.id,
      razorpayPaymentId,
      razorpaySignature,
      client,
    });

    await orderRepository.updateOrderStatus(order.id, 'paid', client);

    for (const item of order.items) {
      const updatedProduct = await productRepository.reduceStock(
        item.product_id,
        item.quantity,
        client
      );

      if (!updatedProduct) {
        throw {
          status: 400,
          message: `Insufficient stock for product ${item.product_id}`,
        };
      }
    }

    await cartRepository.clearCart(cartId, client);

    await client.query('COMMIT');

    return paidPayment;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

const paymentRepository = {
  createPaymentOrderRecord,
  getPaymentByRazorpayOrderId,
  updatePaymentAsPaid,
  markPaymentFailed,
  finalizeSuccessfulPayment,
};

export default paymentRepository;