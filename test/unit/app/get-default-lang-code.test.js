import proxyquire from 'proxyquire'
import assert from 'assert'
import sinon from 'sinon'

describe('Get First Time Language Code', function () {

  after(function () {
    sinon.restore()
  })

  it('returns en when extension i18n api is not provided', async function () {
    const getDefaultLangCode = proxyquire('../../../app/scripts/lib/get-default-lang-code.js', {
      'extensionizer': {},
    }).default

    assert.equal(await getDefaultLangCode(), 'en')
  })

  it('returns en when getUILanguage returns a locale that is not in our list', async function () {

    const getDefaultLangCode = proxyquire('../../../app/scripts/lib/get-default-lang-code.js', {
      'extensionizer': {
        'i18n': {
          getUILanguage: sinon.stub().returns('test'),
        },
      },
    }).default

    assert.equal(await getDefaultLangCode(), 'en')
  })

  it('returns correct locale in MetaMask _locales/index from browser i18n.getUILanguage()', async function () {

    const getDefaultLangCode = proxyquire('../../../app/scripts/lib/get-default-lang-code.js', {
      'extensionizer': {
        'i18n': {
          getUILanguage: sinon.stub().returns('pt-BR'),
        },
      },
    }).default

    assert.equal(await getDefaultLangCode(), 'pt_BR')
  })
})
