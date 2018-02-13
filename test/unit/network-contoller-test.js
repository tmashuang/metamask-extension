const assert = require('assert')
const NetworkController = require('../../app/scripts/controllers/network')
const { createTestProviderTools } = require('../stub/provider')


describe('# Network Controller', function () {
  let networkController, provider, providerResultStub, testBlockchain
  const networkControllerProviderInit = {
    getAccounts: () => {},
  }

  beforeEach(function () {
    providerResultStub = {
      // 1 gwei
      eth_gasPrice: '0x0de0b6b3a7640000',
      // by default, all accounts are external accounts (not contracts)
      eth_getCode: '0x',
    }
    const providerTools = createTestProviderTools({ scaffold: providerResultStub })
    provider = providerTools.provider
    testBlockchain = providerTools.testBlockchain

    networkController = new NetworkController({
      provider,
    })

    networkController.initializeProvider(networkControllerProviderInit, provider)
  })
  describe('network', function () {
    describe('#provider', function () {
      it('provider should be updatable without reassignment', function () {
        networkController.initializeProvider(networkControllerProviderInit, provider)
        const proxy = networkController._proxy
        proxy.setTarget({ test: true, on: () => {} })
        assert.ok(proxy.test)
      })
    })
    describe('#getNetworkState', function () {
      it('should return loading when new', function () {
        const networkState = networkController.getNetworkState()
        assert.equal(networkState, 'loading', 'network is loading')
      })
    })

    describe('#setNetworkState', function () {
      it('should update the network', function () {
        networkController.setNetworkState(1)
        const networkState = networkController.getNetworkState()
        assert.equal(networkState, 1, 'network is 1')
      })
    })

    describe('#getRpcAddressForType', function () {
      it('should return the right rpc address', function () {
        const rpcTarget = networkController.getRpcAddressForType('mainnet')
        assert.equal(rpcTarget, 'https://mainnet.infura.io/metamask', 'returns the right rpcAddress')
      })
    })
    describe('#setProviderType', function () {
      it('should update provider.type', function () {
        networkController.setProviderType('mainnet')
        const type = networkController.getProviderConfig().type
        assert.equal(type, 'mainnet', 'provider type is updated')
      })
      it('should set the network to loading', function () {
        networkController.setProviderType('mainnet')
        const loading = networkController.isNetworkLoading()
        assert.ok(loading, 'network is loading')
      })
      it('should set the right rpcTarget', function () {
        networkController.setProviderType('mainnet')
        const rpcTarget = networkController.getProviderConfig().rpcTarget
        assert.equal(rpcTarget, 'https://mainnet.infura.io/metamask', 'returns the right rpcAddress')
      })
    })
  })
})

function dummyProviderConstructor() {
  return {
    // provider
    sendAsync: noop,
    // block tracker
    _blockTracker: {},
    start: noop,
    stop: noop,
    on: noop,
    addListener: noop,
    once: noop,
    removeAllListeners: noop,
  }
}

function noop() {}