class Config {
  static get redis() {
    return {
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    }
  }

  static get winston() {
    return {
      level: process.env.LOG_LEVEL || 'info',
    }
  }

  static get auth() {
    return {
      enabled: process.env.AUTH_ENABLED === 'true',
    }
  }

  static get microservices() {
    return {
      imageProcessing: {
        url: process.env.SERVICE_LAYER_URL || 'http://localhost:3000',
      }
    }
  }
}

export default Config
