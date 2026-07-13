import { z } from 'zod';

const createGatewayOrderSchema = z.object({
  body: z.object({
    order_id: z.coerce.number('Order ID must be a number'),
  }),
});

const verifyPaymentSchema = z.object({
  body: z.object({
    razorpay_order_id: z.string().min(1, 'Razorpay order ID is required'),
    razorpay_payment_id: z.string().min(1, 'Razorpay payment ID is required'),
    razorpay_signature: z.string().min(1, 'Razorpay signature is required'),
  }),
});

const paymentValidator = {
  createGatewayOrderSchema,
  verifyPaymentSchema,
};

export default paymentValidator;