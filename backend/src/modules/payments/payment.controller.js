// src/modules/payments/payment.controller.js

import paymentService from './payment.service.js';

async function createGatewayOrder(req, res, next) {
  try {
    const { order_id } = req.body;

    const result = await paymentService.createGatewayOrder(
      req.user.id,
      Number(order_id)
    );

    res.status(201).json({
      message: 'Razorpay order created',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function verifyPayment(req, res, next) {
  try {
    const result = await paymentService.verifyAndFinalizePayment(
      req.user.id,
      req.body
    );

    res.status(200).json({
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

const paymentController = {
  createGatewayOrder,
  verifyPayment,
};

export default paymentController;