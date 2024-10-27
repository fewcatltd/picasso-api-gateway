import { createServer } from 'http';
import initApp from './app.js';
import Logger from './common/logger.js';
import gracefulShutdown from './common/gracefulShutdown.js';

const logger = Logger.child({ module: 'server.js' });

const startServer = async () => {
  try {
    const app = await initApp();
    const PORT = process.env.PORT || 3001;
    const HOST = process.env.HOST || '0.0.0.0';
    const server = createServer(app);

    server.listen(PORT, HOST, () => {
      logger.info(`Server is running on port ${PORT}, host ${HOST}`);
    });

    gracefulShutdown(server, async () => {
      if (app.locals.redis && app.locals.redis.status === 'ready') {
        await app.locals.redis.quit();
      }
    });

    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', err);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  } catch (error) {
    logger.error('Error starting server', error);
    process.exit(1);
  }
};

startServer();
