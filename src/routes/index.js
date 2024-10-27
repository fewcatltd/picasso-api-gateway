import imagesRouter from './images.js';
import imageRouter from './image.js';
import healthRouter from './health.js';
import createRateLimitMiddleware from '../middlewares/rateLimiterMiddleware.js';
import Config from '../common/config.js'

export default (app, redis) => {
  app.use(
    '/images',
    createRateLimitMiddleware({
      windowMs: Config.rps.images.windowMs,
      max: Config.rps.images.max,
      message: 'Too many requests, please try again later.',
      redis,
    }),
    imagesRouter
  );

  app.use(
    '/image',
    createRateLimitMiddleware({
      windowMs: Config.rps.image.windowMs,
      max: Config.rps.image.max,
      message: 'Too many requests, please try again later.',
      redis,
    }),
    imageRouter
  );

  app.use(
    '/health',
    createRateLimitMiddleware({
      windowMs: Config.rps.health.windowMs,
      max: Config.rps.health.max,
      message: 'Too many requests, please try again later.',
      redis,
    }),
    healthRouter
  );
};
