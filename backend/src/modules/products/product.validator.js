import { z } from 'zod';

const getProductsSchema = z.object({
  query: z.object({
    id: z.coerce.number('ID must be a number').optional(),
    name: z.string().optional(),
    brand: z.string().optional(),
    category: z.string().optional(),
    minPrice: z.coerce.number('minPrice must be a number').optional(),
    maxPrice: z.coerce.number('maxPrice must be a number').optional(),
    keywords: z.string().optional(),
  }),
});

const getProductSchema = z.object({
  params: z.object({
    id: z.coerce.number('ID must be a number'),
  }),
});

const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    brand: z.string().optional(),
    category: z.string().optional(),
    price_cents: z.coerce.number('Price must be a number').positive('Price must be positive'),
    stock: z.coerce.number('Stock must be a number').optional(),
    description: z.string().optional(),
  }),
});

const productValidator = {
  getProductsSchema,
  getProductSchema,
  createProductSchema,
};

export default productValidator;