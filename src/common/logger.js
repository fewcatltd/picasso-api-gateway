import winston from 'winston'
import Config from './config.js'

export default winston.createLogger({
  level: Config.winston.level,
  format: winston.format.json(),
  transports: [
    new winston.transports.Console()
  ]
})
