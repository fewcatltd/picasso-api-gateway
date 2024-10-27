import {expect} from 'chai'
import request from 'supertest'
import nock from 'nock'
import Config from '../../src/common/config.js'
import initApp from '../../src/app.js'

describe('Route /image tests', () => {
  let app

  before(async () => {
    app = await initApp()
  })

  after(() => {
    nock.cleanAll()
  })

  describe('GET /images', () => {

    it('should return 500 if query incorrect', async () => {
      let response = await request(app).get('/images?invalid-query')

      expect(response.status).to.equal(400)
    })

    it('should pass query validation', async () => {
      const query = {
        limit: 10,
        offset: 5,
        sort: 'asc',
        startDate: '2021-01-01',
        endDate: '2021-01-01',
        minWidth: 100,
        maxWidth: 200,
        minHeight: 100,
        maxHeight: 200,
        format: 'gif'
      }
      const queryParams = new URLSearchParams(query).toString();

      nock(`${Config.microservices.imageProcessing.url}`)
        .get(`/images?${queryParams}`)
        .reply(200, [])

      let response = await request(app).get(`/images?${queryParams}`)

      expect(response.status).to.equal(200)
    })

  })
})
