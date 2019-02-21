const assert = require('assert')
const fetchMock = require('fetch-mock')
const { getMessage, fetchLocale } = require('../../../ui/i18n-helper')
const enLocale = require('../../../app/_locales/en/messages.json')


describe('i18n', () => {

  before(() => {
    fetchMock.get('*', enLocale)
  })

  after(() => {
    fetchMock.restore()
  })

  it('returns null for no locale specified', () => {
    const i18nGetMessage = getMessage()
    assert.equal(i18nGetMessage, null)
  })

  it('returns null for a message not found in the locale', () => {
    const i18nGetMessage = getMessage(enLocale, 'test error')
    assert.equal(i18nGetMessage, null)
  })

  it('#fetchLocale', async () => {
    const response = await fetchLocale('en')
    assert.equal(typeof response, 'object')
    assert.equal(response.builtInCalifornia.message, 'MetaMask is designed and built in California.')
  })

  it('#getMessage', () => {
    const i18nGetMessage = getMessage(enLocale, 'builtInCalifornia')
    assert.equal(i18nGetMessage, 'MetaMask is designed and built in California.')
  })
})
