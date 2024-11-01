import helmet from 'helmet'
import compression from 'compression'
import cors from 'cors'
import express from 'express'
import Logger from '../common/logger.js'

export default (app) => {
  app.use(cors())
  app.use(compression())
  app.use(helmet())
  app.use(express.urlencoded({extended: false}))
  app.use(express.json())
  app.use((req, res, next) => {
    Logger.child({requestId: req.id}).debug('Incoming request', {url: req.url, method: req.method})
    next()
  })

};
