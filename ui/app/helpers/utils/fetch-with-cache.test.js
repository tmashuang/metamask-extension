import assert from 'assert'
import nock from 'nock'
import sinon from 'sinon'

const fakeLocalStorageHelpers = {}
jest.mock('../../../lib/local-storage-helpers', () => fakeLocalStorageHelpers);
const fetchWithCache = require('./fetch-with-cache').default

describe('Fetch with cache', () => {
  beforeEach(() => {
    fakeLocalStorageHelpers.loadLocalStorageData = sinon.stub()
    fakeLocalStorageHelpers.saveLocalStorageData = sinon.stub()
  })
  afterEach(() => {
    sinon.restore()
    nock.cleanAll()
  })

  it('fetches a url', async () => {
    nock('https://fetchwithcache.metamask.io')
      .get('/price')
      .reply(200, '{"average": 1}')

    const response = await fetchWithCache('https://fetchwithcache.metamask.io/price')
    assert.deepEqual(response, {
      average: 1,
    })
  })

  it('returns cached response', async () => {
    nock('https://fetchwithcache.metamask.io')
      .get('/price')
      .reply(200, '{"average": 2}')

    fakeLocalStorageHelpers.loadLocalStorageData.returns({
      'https://fetchwithcache.metamask.io/price': {
        cachedResponse: { average: 1 },
        cachedTime: Date.now(),
      },
    })

    const response = await fetchWithCache('https://fetchwithcache.metamask.io/price')
    assert.deepEqual(response, {
      average: 1,
    })
  })

  it(
    'fetches URL again after cache refresh time has passed',
    async () => {
      nock('https://fetchwithcache.metamask.io')
        .get('/price')
        .reply(200, '{"average": 3}')

      fakeLocalStorageHelpers.loadLocalStorageData.returns({
        'https://fetchwithcache.metamask.io/cached': {
          cachedResponse: { average: 1 },
          cachedTime: Date.now() - 1000,
        },
      })

      const response = await fetchWithCache('https://fetchwithcache.metamask.io/price', {}, { cacheRefreshTime: 123 })
      assert.deepEqual(response, {
        average: 3,
      })
    }
  )

  it(
    'should abort the request when the custom timeout is hit',
    async () => {
      nock('https://fetchwithcache.metamask.io')
        .get('/price')
        .delay(100)
        .reply(200, '{"average": 4}')

      await assert.rejects(
        () => fetchWithCache('https://fetchwithcache.metamask.io/price', {}, { timeout: 20 }),
        { name: 'AbortError', message: 'Aborted' },
      )
    }
  )

  it('throws when the response is unsuccessful', async () => {
    nock('https://fetchwithcache.metamask.io')
      .get('/price')
      .reply(500, '{"average": 6}')

    await assert.rejects(
      () => fetchWithCache('https://fetchwithcache.metamask.io/price'),
    )
  })

  it('throws when a POST request is attempted', async () => {
    nock('https://fetchwithcache.metamask.io')
      .post('/price')
      .reply(200, '{"average": 7}')

    await assert.rejects(
      () => fetchWithCache('https://fetchwithcache.metamask.io/price', { method: 'POST' }),
    )
  })

  it('throws when the request has a truthy body', async () => {
    nock('https://fetchwithcache.metamask.io')
      .get('/price')
      .reply(200, '{"average": 8}')

    await assert.rejects(
      () => fetchWithCache('https://fetchwithcache.metamask.io/price', { body: 1 }),
    )
  })

  it(
    'throws when the request has an invalid Content-Type header',
    async () => {
      nock('https://fetchwithcache.metamask.io')
        .get('/price')
        .reply(200, '{"average": 9}')

      await assert.rejects(
        () => fetchWithCache('https://fetchwithcache.metamask.io/price', { headers: { 'Content-Type': 'text/plain' } }),
        { message: 'fetchWithCache only supports JSON responses' },
      )
    }
  )
})
