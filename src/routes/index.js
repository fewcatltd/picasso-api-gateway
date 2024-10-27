import imagesRouter from './images.js';
import imageRouter from './image.js';
import healthRouter from './health.js';
import createRateLimitMiddleware from '../middlewares/rateLimiterMiddleware.js';

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
      windowMs: 3 * 1000,
      max: 1,
      message: 'Too many requests, please try again later.',
      redis,
    }),
    healthRouter
  );
};
