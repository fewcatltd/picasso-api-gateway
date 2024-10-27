import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'

function createRateLimitMiddleware(options = {
  windowMs: 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.',
  redis: undefined
}) {
  if (!options.redis) {
    throw new Error('Redis is required')
  }

  return rateLimit({
    windowMs: options.windowMs || 60 * 1000,
    max: options.max || 100,
    message: options.message || 'Too many requests, please try again later.',
    keyGenerator: (req) => req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    passOnStoreError: false,
    store: new RedisStore({
      sendCommand: (...args) => options.redis.call(...args)
    })
  })
}

export default createRateLimitMiddleware
