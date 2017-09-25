const assert = require('assert')
const sinon = require('sinon')
const clone = require('clone')
const MetaMaskController = require('../../app/scripts/metamask-controller')
const firstTimeState = require('../../app/scripts/first-time-state')

describe('MetaMaskController', function () {
  const noop = () => {}
  const metamaskController = new MetaMaskController({
    showUnconfirmedMessage: noop,
    unlockAccountMessage: noop,
    showUnapprovedTx: noop,
    // initial state
    initState: clone(firstTimeState),
  })

  beforeEach(function () {
    // sinon allows stubbing methods that are easily verified
    this.sinon = sinon.sandbox.create()
  })

  afterEach(function () {
    // sinon requires cleanup otherwise it will overwrite context
    this.sinon.restore()
  })

  describe('Metamask Controller', function () {
    it('exists', function () {
      assert(metamaskController)
    })

    describe('#initializeProvider', function () {
      it('has a initializeProvider method and calls network controller and pass opts for the provider', function () {

      })
      it('returns a provider', function () {

      })
    })

    describe('#initPublicConfigStore', function () {
      it('returns a publicConfigStore that has the keys selectedAddress and NetworkVersio', function () {

      })
    })

    describe('#getState', function () {
      it('returns the state used by trusted connections', function () {

      })
    })

    describe('#getApi', function () {
      it('returns the api used by trusted connections', function () {

      })
    })
  })


})

