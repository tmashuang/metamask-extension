const assert = require('assert')
const fetchMock = require('fetch-mock')
const { getMessage, fetchLocale } = require('../../../ui/i18n-helper')
const enLocale = require('../../../app/_locales/en/messages.json')


describe('i18n', () => {
  // This is a representation of  state.localMessages.
  const localeMessages = {
    current: enLocale,
  }

  before(() => {
    fetchMock.get('*', enLocale)
  })

  after(() => {
    fetchMock.restore()
  })

  it('#fetchLocale', async () => {
    const response = await fetchLocale('en')
    assert.equal(typeof response, 'object')
    assert.equal(response.builtInCalifornia.message, 'MetaMask is designed and built in California.')
  })

  it('#getMessage', () => {
    const i18nGetMessage = getMessage(localeMessages, 'builtInCalifornia')
    assert.equal(i18nGetMessage, 'MetaMask is designed and built in California.')
  })
})
