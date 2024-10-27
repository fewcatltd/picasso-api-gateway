import express from 'express';
import Redis from 'ioredis';
import configureMiddleware from './middlewares/index.js';
import configureRoutes from './routes/index.js';
import errorHandler from 'error-handler-json';
import Logger from './common/logger.js';
import Config from './common/config.js';
import { createRequire } from 'module';

const apiMetrics = createRequire(import.meta.url)("prometheus-api-metrics");
const logger = Logger.child({ module: 'app.js' });

const initApp = async (options = {}) => {
  try {
    const redis = options.redis || new Redis(Config.redis.url, {
      retryStrategy(times) {
        return Math.min(times * 2000, 10000);
      }
    });

    redis.on('connect', () => logger.info('Redis connected'));
    redis.on('error', (err) => logger.error('Redis error:', err));

    const app = express();
    app.locals.redis = redis;

    configureMiddleware(app);
    if (!options.skipMetrics) {
      app.use(apiMetrics());
    }
    configureRoutes(app, redis);
    app.use(errorHandler());

    return app;
  } catch (error) {
    logger.error('Error initializing app', error);
    process.exit(1);
  }
};

export default initApp;
