import express from 'express'
import {
  createValidator
} from 'express-joi-validation'
import Joi from 'joi'
import axios from 'axios'
import Config from '../common/config.js'
import Logger from '../common/logger.js'

const router = express.Router()
const validator = createValidator()
const logger = Logger.child({module: 'image.js'})
router.get('/', validator.query(Joi.object({
  limit: Joi.number().integer().min(1).max(100).optional(),
  offset: Joi.number().integer().min(0).default(0).optional(),
  sort: Joi.string().valid('asc', 'desc', 'ASC', 'DESC').optional(),
   startDate: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .optional()
        .messages({ 'string.pattern.base': 'startDate must be in YYYY-MM-DD format' }),
      endDate: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .optional()
        .messages({ 'string.pattern.base': 'endDate must be in YYYY-MM-DD format' }),
  minWidth: Joi.number().integer().min(0).optional(),
  maxWidth: Joi.number().integer().min(0).optional(),
  minHeight: Joi.number().integer().min(0).optional(),
  maxHeight: Joi.number().integer().min(0).optional(),
  format: Joi.string().valid('gif', 'mp4', 'webp').optional()
})), async (req, res) => {
  try {
    const queryParams = new URLSearchParams(req.query)

    const response = await axios.get(`${Config.microservices.imageProcessing.url}/images?${queryParams}`)

    res.status(response.status).json(response.data)
  } catch (e) {
    logger.error('Error creating image', e)
    res.status(500).json({error: 'Failed to create image'})
  }
})

export default router
