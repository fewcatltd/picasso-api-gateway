import express from 'express'
import checkRedisConnection from '../middlewares/checkRedisConnection.js'
import rateLimiterMiddleware from '../middlewares/rateLimiterMiddleware.js'

const router = express.Router()

router.get('/readiness', async (req, res) => {
  res.send('Ok')
})

router.get('/liveness',
  checkRedisConnection,
  async (req, res) => {
    res.send('Ok')
  })

export default router
