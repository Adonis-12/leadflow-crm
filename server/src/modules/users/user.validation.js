import { z } from 'zod';

export const updateUserSchema = z.object({
  role: z.enum(['ADMIN', 'SALES_REP']),
});

export const listUsersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});