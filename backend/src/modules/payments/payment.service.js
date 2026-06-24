import crypto from 'crypto';
import Razorpay from 'razorpay';
import paymentRepository from './payment.repository.js';
import orderService from '../orders/order.service.js';
import cartRepository from '../carts/cart.repository.js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function createGatewayOrder(userId, orderId) {
  const order = await orderService.getOrderById(orderId, userId);

  if (order.status !== 'pending') {
    throw {
      status: 400,
      message: 'Payment can only be started for pending orders',
    };
  }

  const razorpayOrder = await razorpay.orders.create({
    amount: order.total_cents,
    currency: 'INR',
    receipt: `order_${order.id}`,
  });

  const payment = await paymentRepository.createPaymentOrderRecord({
    orderId: order.id,
    userId,
    razorpayOrderId: razorpayOrder.id,
    amountCents: order.total_cents,
  });

  return {
    order_id: order.id,
    amount_cents: order.total_cents,
    amount: `₹${(order.total_cents / 100).toFixed(0)}`,
    currency: 'INR',
    razorpay_order_id: razorpayOrder.id,
    razorpay_key_id: process.env.RAZORPAY_KEY_ID,
    payment_id: payment.id,
  };
}

function verifySignature({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) {
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  return expectedSignature === razorpay_signature;
}

async function verifyAndFinalizePayment(userId, payload) {
  const {
    order_id,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = payload;

  if (
    !order_id ||
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature
  ) {
    throw { status: 400, message: 'Missing payment verification fields' };
  }

  const payment = await paymentRepository.getPaymentByRazorpayOrderId(
    razorpay_order_id
  );

  if (!payment || payment.user_id !== userId || payment.order_id !== Number(order_id)) {
    throw { status: 404, message: 'Payment record not found' };
  }

  if (payment.status === 'paid') {
    return {
      message: 'Payment already verified',
      order_id: payment.order_id,
      payment_id: payment.id,
    };
  }

  const isValid = verifySignature({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  });

  if (!isValid) {
    await paymentRepository.markPaymentFailed(payment.id);
    throw { status: 400, message: 'Invalid payment signature' };
  }

  const order = await orderService.getOrderById(payment.order_id, userId);

  if (order.status !== 'pending') {
    throw { status: 400, message: 'Order is not in payable state' };
  }

  const cart = await cartRepository.getOrCreateCart(userId);

  await paymentRepository.finalizeSuccessfulPayment({
    payment,
    order,
    cartId: cart.id,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
  });

  return {
    message: 'Payment verified successfully',
    order_id: order.id,
    payment_id: payment.id,
    status: 'paid',
  };
}

const paymentService = {
  createGatewayOrder,
  verifyAndFinalizePayment,
};

export default paymentService;