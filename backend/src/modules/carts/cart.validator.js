import { z } from 'zod';

const addItemSchema = z.object({
  body: z.object({
    product_id: z.coerce.number('Product ID must be a number'),
    quantity: z.coerce.number('Quantity must be a number').positive('Quantity must be positive').optional(),
  }),
});

const updateItemSchema = z.object({
  params: z.object({
    itemId: z.coerce.number('Item ID must be a number'),
  }),
  body: z.object({
    quantity: z.coerce.number('Quantity must be a number').positive('Quantity must be positive'),
  }),
});

const removeItemSchema = z.object({
  params: z.object({
    itemId: z.coerce.number('Item ID must be a number'),
  }),
});

const cartValidator = {
  addItemSchema,
  updateItemSchema,
  removeItemSchema,
};

export default cartValidator;