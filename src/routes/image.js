import express from 'express'
import {
  createValidator
} from 'express-joi-validation'
import Joi from 'joi'
import axios from 'axios'
import {pipeline} from 'stream'
import {promisify} from 'util'
import Logger from '../common/logger.js'
import Config from '../common/config.js'

const logger = Logger.child({module: 'image.js'})
const router = express.Router()
const validator = createValidator()

const streamPipeline = promisify(pipeline)
router.post(
  '/',
  validator.query(Joi.object().empty().max(0)),
  validator.body(Joi.object().empty().max(0)),

  async (req, res) => {
    try {
      const response = await axios.post(`${Config.microservices.imageProcessing.url}/image`)

      res.status(response.status).json(response.data)
    } catch (e) {
      logger.error('Error creating image', e)
      res.status(500).json({error: 'Failed to create image'})
    }
  }
)
router.get(
  '/:id',
  validator.params(Joi.object({id: Joi.string().uuid().required()})),
  validator.query(Joi.object().empty().max(0)),

  async (req, res) => {
    try {
      const microserviceResponse = await axios.get(
        `${Config.microservices.imageProcessing.url}/image/${req.params.id}`,
        {
          validateStatus: (status) => status >= 200 && status < 300
        }
      )
      const {data} = microserviceResponse
      if(!data.s3Url) {
        logger.child({imageId: req.params.id}).error('Image data is incomplete or corrupted')
        return res.status(500).json({ error: 'Image data is incomplete or corrupted' });
      }

      const imageResponse = await axios({
        method: 'get',
        url: data.s3Url,
        responseType: 'stream',
        validateStatus: (status) => status >= 200 && status < 300
      })

      res.setHeader('Content-Type', imageResponse.headers['content-type'])

      req.on('close', () => {
        if (!res.writableEnded) {
          logger.child({imageId: req.params.id}).warn('Request closed by the client')
          imageResponse.data.destroy() // Останавливаем поток данных
        }
      })
      // обработка ошибок на уровне потока!
      imageResponse.data.on('error', (err) => {
        logger.child({imageId: req.params.id}).error('Error while streaming the image', err)
        res.status(500).send('Error while streaming the image')
      })
      await streamPipeline(imageResponse.data, res)
    } catch (error) {
      logger.child({imageId: req.params.id}).error('Error retrieving the image', error)
      const status = error.response?.status || 500
      res.status(status).send('Error retrieving the image')
    }
  }
)

export default router
