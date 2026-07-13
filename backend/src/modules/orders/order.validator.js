import { z } from 'zod';

const getOrderByIdSchema = z.object({
  params: z.object({
    orderId: z.coerce.number('Order ID must be a number'),
  }),
});

const orderValidator = {
  getOrderByIdSchema,
};

export default orderValidator;