
import { z } from 'zod';

const activityTypes = ['CALL', 'MEETING', 'EMAIL', 'TASK'];

export const createActivitySchema = z.object({
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().max(2000).nullable().optional(),
  type: z.enum(activityTypes).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  leadId: z.string().nullable().optional(),
});

export const updateActivitySchema = z.object({
  title: z.string().trim().min(2).max(150).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  type: z.enum(activityTypes).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  completed: z.boolean().optional(),
  leadId: z.string().nullable().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'Provide at least one field to update',
});

export const listActivitiesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  type: z.enum(activityTypes).optional(),
  completed: z.enum(['true', 'false']).optional(),
});
