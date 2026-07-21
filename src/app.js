import express from 'express';
import createError from 'http-errors';

import authRouter from './routes/auth-routes.js';
import monitorRoutes from './routes/monitor-routes.js';
import reportRoutes from './routes/report-routes.js';
import { getPublicStatus } from './controllers/report-controller.js';

import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import rateLimit from 'express-rate-limit';
import { logger } from '../lib/logger.js';
import { mountDocs } from './routes/docs-route.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);

  app.use(helmet({ contentSecurityPolicy: false }));

  app.use(cors());

  app.use(pinoHttp({ logger }));

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
    }),
  );

  app.use(express.json());

  app.get('/', (req, res) => {
    res.status(200).json({
      success: true,
      name: 'Pulse-Uptime Monitor api',
      version: '1.2.0',
      description:
        'Pulse is a REST API for monitoring website uptime, recording incidents, and serving a public status page',
      docs: '/docs',
      health: '/health',
    });
  });

  app.use('/health', (req, res) => {
    res.json({
      status: 'OK',
    });
  });

  mountDocs(app);

  app.use('/auth', authRouter);

  app.use('/monitors', monitorRoutes);

  app.get('/status', getPublicStatus);

  app.use('/', reportRoutes);

  app.use((req, res, next) => {
    next(createError(404, 'Resource not found'));
  });

  app.use((err, req, res) => {
    req.log.error(err);

    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error',
    });
  });

  return app;
}
