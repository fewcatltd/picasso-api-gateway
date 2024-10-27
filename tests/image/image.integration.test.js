import {expect} from 'chai'
import request from 'supertest'
import nock from 'nock'
import Config from '../../src/common/config.js'
import initApp from '../../src/app.js'

describe('Route /image tests', () => {
  let app
  const imageId = '94c69241-0ec3-4bde-b8c3-649fad2634ce'
  const testGifUrl = 'https://fewcat-picasso.fra1.cdn.digitaloceanspaces.com/gifs/0IsvmJu5xMaAl1ckJX-fixed_height_small-gif-ce8f680a-0f62-48d6-981b-4a72c84b0588.gif'


  before(async () => {
    app = await initApp()
  })

  after(() => {
    nock.cleanAll()
  })

  describe('GET /image', () => {

    it('should return 200 and gif by id', async () => {
      nock(Config.microservices.imageProcessing.url)
        .get(`/image/${imageId}`)
        .reply(200, {s3Url: testGifUrl})

      const response = await request(app).get(`/image/${imageId}`)

      expect(response.status).to.equal(200)
      expect(response.headers['content-type']).to.equal('image/gif')

      // Проверяем, что буфер данных не пустой
      expect(response.body).to.be.instanceOf(Buffer)
      expect(response.body.length).to.be.greaterThan(0)
    })
    it('should return 404 if image not found', async () => {
      nock(Config.microservices.imageProcessing.url)
        .get(`/image/${imageId}`)
        .reply(404)

      const response = await request(app).get(`/image/${imageId}`)

      expect(response.status).to.equal(404)
    })
    it('should return 500 if srUrl missing', async () => {

      nock(Config.microservices.imageProcessing.url)
        .get(`/image/${imageId}`)
        .reply(200, {})

      const response = await request(app).get(`/image/${imageId}`)

      expect(response.status).to.equal(500)
    })
    it('should return 500 if incorrect s3Url', async () => {
      nock(Config.microservices.imageProcessing.url)
        .get(`/image/${imageId}`)
        .reply(200, {s3Url: 'https://'})

      const response = await request(app).get(`/image/${imageId}`)

      expect(response.status).to.equal(500)
    })
    it('should return 500 if image service is unavailable', async () => {
      nock(Config.microservices.imageProcessing.url)
        .get(`/image/${imageId}`)
        .reply(500)

      const response = await request(app).get(`/image/${imageId}`)

      expect(response.status).to.equal(500)
    })
    it('should return 500 if incorrect params', async () => {
      const response = await request(app).get('/image/invalid-id')

      expect(response.status).to.equal(400)
    })
    it('should return 500 if incorrect query', async () => {
      const response = await request(app).get(`/image/${imageId}?invalid-query`)

      expect(response.status).to.equal(400)
    })
  })

  describe('POST /image', () => {

    it('should return 200 and image data', async () => {
      const body = [
        {id: imageId},
        {id: imageId}
      ]
      nock(Config.microservices.imageProcessing.url)
        .post('/image')
        .reply(200, body)

      const response = await request(app).post('/image')

      expect(response.status).to.equal(200)
      expect(response.body).to.deep.equal(body)
    })
    it('should return 400 if pass any query', async () => {
      const response = await request(app).post('/image?invalid-query')

      expect(response.status).to.equal(400)
    })
    it('should return 400 if pass any body', async () => {
      const response = await request(app).post('/image').send({any: 'body'})

      expect(response.status).to.equal(400)
    })
  })
})
