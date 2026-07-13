import { z } from 'zod';

const chatSchema = z.object({
  body: z.object({
    message: z.string().min(1, 'Message is required'),
    mode: z.string().optional(),
  }),
});

const aiValidator = {
  chatSchema,
};

export default aiValidator;