import { z } from 'zod';

const stages = [
  'QUALIFICATION',
  'PROPOSAL',
  'NEGOTIATION',
  'WON',
  'LOST',
];

export const createDealSchema = z.object({
  title: z.string().trim().min(2).max(150),
  value: z.coerce.number().min(0).max(9999999999.99),
  stage: z.enum(stages).optional(),
  leadId: z.string().min(1),
  expectedCloseDate: z.string().datetime().nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
});

export const updateDealSchema = z.object({
  title: z.string().trim().min(2).max(150).optional(),
  value: z.coerce.number().min(0).max(9999999999.99).optional(),
  stage: z.enum(stages).optional(),
  expectedCloseDate: z.string().datetime().nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'Provide at least one field to update',
});

export const listDealsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(100).optional(),
  stage: z.enum(stages).optional(),
});