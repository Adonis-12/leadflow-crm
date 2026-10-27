
import { z } from 'zod';

const optionalText = (max) =>
  z.string().trim().max(max).optional().nullable();

export const createLeadSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.union([
    z.string().trim().email().max(254),
    z.literal(''),
  ]).optional().transform((v) => v || undefined),
  phone: optionalText(30),
  company: optionalText(120),
  source: optionalText(80),
  status: z.enum([
    'NEW',
    'CONTACTED',
    'QUALIFIED',
    'CONVERTED',
    'LOST',
  ]).optional(),
  notes: optionalText(2000),
  assignedToId: z.string().optional(),
});

export const updateLeadSchema = createLeadSchema
  .partial()
  .omit({ assignedToId: true })
  .extend({
    assignedToId: z.string().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update',
  });

export const listLeadsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(100).optional(),
  status: z.enum([
    'NEW',
    'CONTACTED',
    'QUALIFIED',
    'CONVERTED',
    'LOST',
  ]).optional(),
});
