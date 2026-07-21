import { Router } from 'express';

import { requireAuth } from '../middleware/auth-middleware.js';

import {
  downloadChecksCsv,
  getMonitorUptime,
  getSingleMonitorChecks,
  listAllIncidents,
  listMonitorIncidents,
} from '../controllers/report-controller.js';
import { validate } from '../middleware/validate-middleware.js';
import {
  monitorIdSchema,
  querySchema,
  uptimeQuerySchema,
} from '../validations/monitor-validation.js';

const router = Router();

router.get('/incidents', requireAuth, listAllIncidents);

router.get(
  '/monitors/:id/checks',
  requireAuth,
  validate(monitorIdSchema, 'params'),
  validate(querySchema, 'query'),
  getSingleMonitorChecks,
);

router.get(
  '/monitors/:id/checks.csv',
  requireAuth,
  validate(monitorIdSchema, 'params'),
  downloadChecksCsv,
);

router.get(
  '/monitors/:id/uptime',
  requireAuth,
  validate(monitorIdSchema, 'params'),
  validate(uptimeQuerySchema, 'query'),
  getMonitorUptime,
);

router.get(
  '/monitors/:id/incidents',
  requireAuth,
  validate(monitorIdSchema, 'params'),
  listMonitorIncidents,
);

export default router;
