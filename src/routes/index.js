import imagesRouter from './images.js';
import imageRouter from './image.js';
import healthRouter from './health.js';
import createRateLimitMiddleware from '../middlewares/rateLimiterMiddleware.js';

import Logger from '../common/logger.js';

export default (app, redis) => {
  app.use(
    '/images',
    createRateLimitMiddleware({
      windowMs: 60 * 1000,
      max: 100,
      message: 'Too many requests, please try again later.',
      redis,
    }),
    imagesRouter
  );

  app.use(
    '/image',
    createRateLimitMiddleware({
      windowMs: 60 * 1000,
      max: 100,
      message: 'Too many requests, please try again later.',
      redis,
    }),
    imageRouter
  );

  app.use(
    '/health',
    createRateLimitMiddleware({
      windowMs: 5 * 1000,
      max: 1,
      message: 'Too many requests, please try again later.',
      skip: (req) => {
        Logger.child({module: 'health rate limit'}).info('Request IP:', req.ip);
        const allowList = ['127.0.0.1', '::1', 'kubernetes-ip'];
        return allowList.includes(req.ip);
      },
      redis,
    }),
    healthRouter
  );
};
