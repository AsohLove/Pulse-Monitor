import { z } from 'zod';

export const createMonitorSchema = z.object({
  name: z.string().trim().min(1).max(150),

  url: z.string().url(),

  interval_seconds: z.int().min(10).max(3600).default(60),

  expected_status: z.int().min(100).max(599).default(200),
});

export const updateMonitorSchema = z
  .object({
    name: z.string().trim().min(1).max(150).optional(),

    url: z.string().url().optional(),

    interval_seconds: z.int().min(10).max(3600).optional(),

    expected_status: z.int().min(100).max(599).optional(),

    is_active: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided!!',
  });

export const monitorIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const querySchema = z.object({
  after: z.coerce.number().int().nonnegative().default(0),
  limit: z.coerce.number().int().nonnegative().max(100).default(10),
});

export const uptimeQuerySchema = z.object({
  window: z.coerce.number().int().positive().default(24),
});
