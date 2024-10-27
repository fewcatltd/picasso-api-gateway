import express from 'express'
import Redis from 'ioredis'
import {createServer} from 'http'
import configureMiddleware from './middlewares/index.js'
import configureRoutes from './routes/index.js'
import errorHandler from 'error-handler-json'
import Logger from './common/logger.js'
import Config from './common/config.js'
import gracefulShutdown from './common/gracefulShutdown.js'
import {createRequire} from "module";

const apiMetrics = createRequire(import.meta.url)("prometheus-api-metrics");

const logger = Logger.child({module: 'app.js'})

const initApp = async (options = {}) => {
  try {
    const redis = options.redis || new Redis(Config.redis.url, {
      retryStrategy(times) {
        return Math.min(times * 2000, 10000)
      }
    })

    redis.on('connect', () => logger.info('Redis connected'))
    redis.on('error', (err) => logger.error('Redis error:', err))

    const app = express()
    app.locals.redis = redis

    configureMiddleware(app)
    if (!options.skipMetrics) {
      app.use(apiMetrics())
    }
    configureRoutes(app, redis)
    app.use(errorHandler())

    if (!options.skipServer) {
      const PORT = process.env.PORT || 3001
      const HOST = process.env.HOST || '0.0.0.0'
      const server = createServer(app)

      server.listen(PORT, HOST, () => {
        logger.info(`Server is running on port ${PORT}, host ${HOST}`)
      })

      gracefulShutdown(server, async () => {
        if (redis.status === 'ready') {
          await redis.quit()
        }
      })

      process.on('uncaughtException', (err) => {
        logger.error('Uncaught Exception:', err)
        process.exit(1)
      })

      process.on('unhandledRejection', (reason, promise) => {
        logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
        process.exit(1)
      })
    }

    return app

  } catch (error) {
    logger.error('Error initializing app', error)
    process.exit(1)
  }
}

if (import.meta.url === process.argv[1]) {
  initApp()
}

export default initApp
