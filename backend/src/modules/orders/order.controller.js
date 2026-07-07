import orderService from './order.service.js';
import { sendSuccess } from '../../utils/response.helper.js';

async function createOrder(req, res, next) {
  try {
    const order = await orderService.createOrder(req.user.id);

    sendSuccess(res, 201, 'Order placed successfully', order);
  } catch (err) {
    next(err);
  }
}

async function getUserOrders(req, res, next) {
  try {
    const orders = await orderService.getUserOrders(req.user.id);

    sendSuccess(res, 200, 'Orders fetched', orders);
  } catch (err) {
    next(err);
  }
}

async function getOrderById(req, res, next) {
  try {
    const orderId = Number(req.params.orderId);
    const order = await orderService.getOrderById(orderId, req.user.id);

    sendSuccess(res, 200, 'Order fetched', order);
  } catch (err) {
    next(err);
  }
}

const orderController = {
  createOrder,
  getUserOrders,
  getOrderById,
};

export default orderController;