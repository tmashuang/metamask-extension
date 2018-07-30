const util = require('util')
const assert = require('assert')
const sinon = require('sinon')
const clone = require('clone')
const nock = require('nock')
const configureStore = require('redux-mock-store').default
const thunk = require('redux-thunk').default
const actions = require('../../../../ui/app/actions')
const MetaMaskController = require('../../../../app/scripts/metamask-controller')
const KeyringController = require('eth-keyring-controller')
const firstTimeState = require('../../../../app/scripts/first-time-state')
const { createTestProviderTools } = require('../../../stub/provider')

const devState = require('../../../data/1-initState.json')
const devState2 = require('../../../data/2-state.json')
const devState3 = require('../../../data/3-importPrivKey.json')
const devState4 = require('../../../data/4-addAccount.json')
const devState5 = require('../../../data/5-signMsg.json')

const middleware = [thunk]
const mockStore = configureStore(middleware)

describe('Actions', () => {

  let background, metamaskController, provider, providerResultStub

  const password = 'a-fake-password'
  const TEST_SEED = 'debris dizzy just program just float decrease vacant alarm reduce speak stadium'

  const noop = () => {}

  beforeEach(async () => {

    nock('https://api.infura.io')
      .get('/v1/ticker/ethusd')
      .reply(200, '{"base": "ETH", "quote": "USD", "bid": 288.45, "ask": 288.46, "volume": 112888.17569277, "exchange": "bitfinex", "total_volume": 272175.00106721005, "num_exchanges": 8, "timestamp": 1506444677}')

    nock('https://api.infura.io')
      .get('/v1/ticker/ethjpy')
      .reply(200, '{"base": "ETH", "quote": "JPY", "bid": 32300.0, "ask": 32400.0, "volume": 247.4616071, "exchange": "kraken", "total_volume": 247.4616071, "num_exchanges": 1, "timestamp": 1506444676}')

    providerResultStub = {
      // 1 gwei
      eth_gasPrice: '0x0de0b6b3a7640000',
      // by default, all accounts are external accounts (not contracts)
      eth_getCode: '0x',
    }

    provider = createTestProviderTools({ scaffold: providerResultStub }).provider

    metamaskController = new MetaMaskController({
      provider,
      keyringController: new KeyringController({

      }),
      showUnapprovedTx: noop,
      showUnconfirmedMessage: noop,
      encryptor: {
        encrypt: function (password, object) {
          this.object = object
          return Promise.resolve('mock-encrypted')
        },
        decrypt: function () {
          return Promise.resolve(this.object)
        },
      },
      initState: clone(firstTimeState),
    })

    await metamaskController.createNewVaultAndRestore(password, TEST_SEED)

    background = metamaskController.getApi()

    actions._setBackgroundConnection(background)

  })

  after(() => {
    nock.restore()
  })

  describe('#tryUnlockMetamask', () => {

    let submitPasswordSpy, verifySeedPhraseSpy

    beforeEach(() => {
      submitPasswordSpy = sinon.spy(background, 'submitPassword')
      verifySeedPhraseSpy = sinon.spy(background, 'verifySeedPhrase')
    })

    afterEach(() => {
      submitPasswordSpy.restore()
      verifySeedPhraseSpy.restore()
    })

    it('', async () => {

      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'UNLOCK_IN_PROGRESS' },
        { type: 'UNLOCK_SUCCEEDED', value: undefined },
        { type: 'UPDATE_METAMASK_STATE', value: devState},
        { type: 'TRANSITION_FORWARD' },
        { type: 'HIDE_LOADING_INDICATION' },
      ]

      const store = mockStore({})

      return store.dispatch(actions.tryUnlockMetamask())
        .then(() => {
          assert(submitPasswordSpy.calledOnce)
          assert(verifySeedPhraseSpy.calledOnce)
          // console.log(util.inspect(store.getActions(), false, null))
          assert.deepEqual(store.getActions(), expectedActions)
        })
    })
  })

  describe('#confirmSeedWords', () => {

    let clearSeedWordCacheSpy

    beforeEach(() => {
      clearSeedWordCacheSpy = sinon.spy(background, 'clearSeedWordCache')
    })

    afterEach(() => {
      clearSeedWordCacheSpy.restore()
    })

    it('', () => {

      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'HIDE_LOADING_INDICATION' },
        { type: 'SHOW_ACCOUNTS_PAGE' },
      ]

      const store = mockStore({})

      return store.dispatch(actions.confirmSeedWords())
        .then(() => {
          assert(clearSeedWordCacheSpy.calledOnce)
          assert.deepEqual(store.getActions(), expectedActions)
        })
        .catch(err => {
          console.log(err)
        })
    })
  })

  describe('#createNewVaultAndRestore', () => {

    let createNewVaultAndRestoreSpy

    beforeEach(() => {
      createNewVaultAndRestoreSpy = sinon.spy(background, 'createNewVaultAndRestore')
    })

    afterEach(() => {
      createNewVaultAndRestoreSpy.restore()
    })

    it('', () => {

      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'DISPLAY_WARNING', value: undefined },
        { type: 'HIDE_LOADING_INDICATION' },
       ]

      const store = mockStore({})

      return store.dispatch(actions.createNewVaultAndRestore())
        .then(() => {
          assert(createNewVaultAndRestoreSpy.calledOnce)
          assert.deepEqual(store.getActions(), expectedActions)
        })
    })
  })

  describe('#createNewVaultAndKeychain', () => {

    let createNewVaultAndKeychainSpy

    beforeEach(() => {
      createNewVaultAndKeychainSpy = sinon.spy(background, 'createNewVaultAndKeychain')
    })

    afterEach(() => {
      createNewVaultAndKeychainSpy.restore()
    })

    it('', () => {
      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'UPDATE_METAMASK_STATE', value: devState2},
        { type: 'HIDE_LOADING_INDICATION' },
      ]

      const store = mockStore()

      return store.dispatch(actions.createNewVaultAndKeychain())
        .then(() => {
          assert(createNewVaultAndKeychainSpy.calledOnce)
          assert.deepEqual(store.getActions(), expectedActions)
        })
    })
  })

  describe('#requestRevealSeed', () => {

    let submitPasswordSpy

    beforeEach(() => {
      submitPasswordSpy = sinon.spy(background, 'submitPassword')
    })

    afterEach(() => {
      submitPasswordSpy.restore()
    })

    it('', () => {
      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'SHOW_NEW_VAULT_SEED', value: TEST_SEED},
        { type: 'HIDE_LOADING_INDICATION' },
      ]

      const store = mockStore()

      return store.dispatch(actions.requestRevealSeed())
        .then(() => {
          assert(submitPasswordSpy.calledOnce)
          assert.deepEqual(store.getActions(), expectedActions)
        })
    })
  })

  describe('#submitPassword', () => {

    let submitPasswordSpy

    beforeEach(() => {
      submitPasswordSpy = sinon.spy(background, 'submitPassword')
    })

    afterEach(() => {
      submitPasswordSpy.restore()
    })

    it('', () => {
      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'SHOW_NEW_VAULT_SEED', value: TEST_SEED},
        { type: 'HIDE_LOADING_INDICATION' },
      ]

      const store = mockStore()

      return store.dispatch(actions.requestRevealSeed())
        .then(() => {
          assert(submitPasswordSpy.calledOnce)
          assert.deepEqual(store.getActions(), expectedActions)
        })
    })
  })

  describe('#resetAccount', () => {

    let resetAccountSpy

    beforeEach(() => {
      resetAccountSpy = sinon.spy(background, 'resetAccount')
    })

    afterEach(() => {
      resetAccountSpy.restore()
    })

    it('', () => {
      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'HIDE_LOADING_INDICATION' },
        { type: 'SHOW_ACCOUNTS_PAGE' },
      ]

      const store = mockStore()

      return store.dispatch(actions.resetAccount())
        .then(() => {
          assert(resetAccountSpy.calledOnce)
          assert.deepEqual(store.getActions(), expectedActions)
        })
    })
  })

  xdescribe('', () => {

    let addNewKeyringSpy
    beforeEach(() => {
      addNewKeyringSpy = sinon.spy(background, 'addNewKeyring')
    })

    afterEach(() => {
      addNewKeyringSpy.restore()
    })

    it('', () => {
      const store = mockStore()

      return store.dispatch(actions.addNewKeyring())
        .then(() => {
          console.log(store.getActions())
        })
    })
  })

  describe('#importNewAccount', () => {

    let importAccountWithStrategySpy

    beforeEach(() => {
      importAccountWithStrategySpy = sinon.spy(background, 'importAccountWithStrategy')
    })

    afterEach(() => {
      importAccountWithStrategySpy.restore()
    })

    it('', () => {
      const store = mockStore()

      const importPrivkey = '4cfd3e90fc78b0f86bf7524722150bb8da9c60cd532564d7ff43f5716514f553'

      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: 'This may take a while, please be patient.' },
        { type: 'HIDE_LOADING_INDICATION' },
        { type: 'UPDATE_METAMASK_STATE', value: devState3 },
        { type: 'SHOW_ACCOUNT_DETAIL', value: '0xe18035bf8712672935fdb4e5e431b1a0183d2dfc' },
      ]

      return store.dispatch(actions.importNewAccount('Private Key', [ importPrivkey ]))
        .then(() => {
          assert(importAccountWithStrategySpy.calledOnce)
          assert.deepEqual(store.getActions(), expectedActions)
        })
    })
  })

  describe('#addNewAccount', () => {

    let addNewAccountSpy

    beforeEach(() => {
      addNewAccountSpy = sinon.spy(background, 'addNewAccount')
    })

    afterEach(() => {
      addNewAccountSpy.restore()
    })

    it('', () => {

      const store = mockStore({metamask: devState2})

      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'HIDE_LOADING_INDICATION' },
        { type: 'UPDATE_METAMASK_STATE', value: devState4 },
      ]

      return store.dispatch(actions.addNewAccount())
        .then(() => {
          assert(addNewAccountSpy.calledOnce)
          assert.deepEqual(store.getActions(), expectedActions)
        })
    })
  })

  describe('#setCurrentCurrency', () => {

    let setCurrentCurrencySpy

    beforeEach(() => {
      setCurrentCurrencySpy = sinon.spy(background, 'setCurrentCurrency')
    })

    afterEach(() => {
      setCurrentCurrencySpy.restore()
    })

    it('', () => {
      const store = mockStore()

      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'HIDE_LOADING_INDICATION' },
        { type: 'SET_CURRENT_FIAT',
          value: {
            currentCurrency: 'jpy',
            conversionRate: 288.45,
            conversionDate: 1506444677,
          },
        },
      ]

      store.dispatch(actions.setCurrentCurrency('jpy'))
      assert(setCurrentCurrencySpy.calledOnce)
      assert.deepEqual(store.getActions(), expectedActions)
    })
  })

  describe('#signMsg', () => {

    let signMessageSpy, metamaskMsgs, msgId, messages

    const msgParams = {
      from: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
      data: '0x879a053d4800c6354e76c7985a865d2922c82fb5b3f4577b2fe08b998954f2e0',
    }

    beforeEach(() => {
      signMessageSpy = sinon.spy(background, 'signMessage')
      metamaskController.newUnsignedMessage(msgParams, noop)
      metamaskMsgs = metamaskController.messageManager.getUnapprovedMsgs()
      messages = metamaskController.messageManager.messages
      msgId = Object.keys(metamaskMsgs)[0]
      messages[0].msgParams.metamaskId = parseInt(msgId)
    })

    afterEach(() => {
      signMessageSpy.restore()
    })

    it('', () => {
      const store = mockStore()

      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'UPDATE_METAMASK_STATE', value: devState5 },
        { type: 'HIDE_LOADING_INDICATION' },
        { type: 'COMPLETED_TX', value: undefined }
      ]

      return store.dispatch(actions.signMsg(msgParams))
        .then(() => {
          assert(signMessageSpy.calledOnce)
          assert.deepEqual(store.getActions(), expectedActions)
        })

    })
  })

  describe('#signPersonalMsg', () => {

    let signPersonalMessageSpy, metamaskMsgs, msgId, personalMessages

    const msgParams = {
      from: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
      data: '0x879a053d4800c6354e76c7985a865d2922c82fb5b3f4577b2fe08b998954f2e0',
    }

    beforeEach(() => {
      signPersonalMessageSpy = sinon.spy(background, 'signPersonalMessage')
      metamaskController.newUnsignedPersonalMessage(msgParams, noop)
      metamaskMsgs = metamaskController.personalMessageManager.getUnapprovedMsgs()
      personalMessages = metamaskController.personalMessageManager.messages
      msgId = Object.keys(metamaskMsgs)[0]
      personalMessages[0].msgParams.metamaskId = parseInt(msgId)
    })

    afterEach(() => {
      signPersonalMessageSpy.restore()
    })

    it('', () => {
      const store = mockStore()

      const expectedActions = [
        { type: 'SHOW_LOADING_INDICATION', value: undefined },
        { type: 'UPDATE_METAMASK_STATE', value: devState },
        { type: 'HIDE_LOADING_INDICATION' },
        { type: 'COMPLETED_TX', value: undefined }
      ]

      return store.dispatch(actions.signPersonalMsg(msgParams))
        .then(() => {
          assert(signPersonalMessageSpy.calledOnce)
          assert.deepEqual(store.getActions(), expectedActions)
        })

    })
  })

})
