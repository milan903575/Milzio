import paymentService from './payment.service.js';
import { sendSuccess } from '../../utils/response.helper.js';

async function createGatewayOrder(req, res, next) {
  try {
    const { order_id } = req.body;

    const result = await paymentService.createGatewayOrder(
      req.user.id,
      Number(order_id)
    );

    sendSuccess(res, 201, 'Razorpay order created', result);
  } catch (err) {
    next(err);
  }
}

async function verifyPayment(req, res, next) {
  try {
    const result = await paymentService.verifyAndFinalizePayment(
      req.user.id,
      req.body
    );

    sendSuccess(res, 200, result.message, result);
  } catch (err) {
    next(err);
  }
}

const paymentController = {
  createGatewayOrder,
  verifyPayment,
};

export default paymentController;