class Config {
  static get redis() {
    return {
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    }
  }

  static get winston() {
    return {
      level: process.env.LOG_LEVEL || 'info'
    }
  }

  static get rps() {
    return {
      image: {
        windowMs: Number(process.env.RPS_IMAGE_WINDOW_MS) || 60 * 1000,
        max: Number(process.env.RPS_IMAGE_MAX) || 100
      },
      images: {
        windowMs: Number(process.env.RPS_IMAGES_WINDOW_MS) || 60 * 1000,
        max: Number(process.env.RPS_IMAGES_MAX) || 100
      },
      health: {
        windowMs: Number(process.env.RPS_HEALTH_WINDOW_MS) || 1 * 1000,
        max: Number(process.env.RPS_HEALTH_MAX) || 1
      }
    }
  }

  static
  get auth() {
    return {
      enabled: process.env.AUTH_ENABLED === 'true'
    }
  }

  static
  get microservices() {
    return {
      imageProcessing: {
        url: process.env.SERVICE_LAYER_URL || 'http://localhost:3000'
      }
    }
  }
}

export default Config
