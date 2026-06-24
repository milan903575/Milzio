import orderService from './order.service.js';

async function createOrder(req, res, next) {
  try {
    const order = await orderService.createOrder(req.user.id);

    res.status(201).json({
      message: 'Order placed successfully',
      data: order,
    });
  } catch (err) {
    next(err);
  }
}

async function getUserOrders(req, res, next) {
  try {
    const orders = await orderService.getUserOrders(req.user.id);

    res.status(200).json({
      message: 'Orders fetched',
      data: orders,
    });
  } catch (err) {
    next(err);
  }
}

async function getOrderById(req, res, next) {
  try {
    const orderId = Number(req.params.orderId);
    const order = await orderService.getOrderById(orderId, req.user.id);

    res.status(200).json({
      message: 'Order fetched',
      data: order,
    });
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