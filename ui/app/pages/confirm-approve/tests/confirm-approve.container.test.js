import React from 'react'
import { Provider } from 'react-redux'
import sinon from 'sinon'
import thunk from 'redux-thunk'
import assert from 'assert'
import configureMockStore from 'redux-mock-store'
import { mountWithRouter } from '../../../../../test/lib/render-helpers'
import ConfirmApprove from '../index'

describe('Confirm Approve', function () {
  let wrapper

  const mockStore = {
    metamask: {
      selectedAddress: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
      assetImages: {},
      addressBook: {},
      ensResolutionsByAddress: {},
      currentCurrency: 'foo',
      conversionRate: 1,
      featureFlags: {
        advancedInlineGas: false,
      },
      provider: {
        type: 'test',
      },
      preferences: {
        showFiatInTestnets: false,
      },
      contractExchangeRates: {
        '0x617b3f8050a0bd94b6b1da02b4384ee5b4df13f4': 1,
      },
      cachedBalances: {
        '66': {
          '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc': '0xde0b6b3a7640000',
        },
      },
      identities: {
        '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc': {
          address: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
          name: 'Account 1',
        },
      },
      accounts: {
        '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc': {
          address: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
          balance: '0xde0b6b3a7640000',
        },
      },
      unapprovedTxs: {
        1: {
          metamaskNetworkId: '66',
          id: 1,
          status: 'unapproved',
          txParams: {
            from: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
            to: '0x617b3f8050a0bd94b6b1da02b4384ee5b4df13f4',
            value: '0x0',
            data: '0x095ea7b3000000000000000000000000ec1adf982415d2ef5ec55899b9bfb8bc0f29251b000000000000000000000000000000000000000000000000016345785d8a0000',
            gas: '0xdaf1',
            gasPrice: '0x77359400',
          },
          type: 'standard',
          origin: 'foo.bar',
          transactionCategory: 'approve',
        },
      },
      currentNetworkTxList: [
        {
          id: 1,
          metamaskNetworkId: '66',
          status: 'unapproved',
          txParams: {
            from: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
            to: '0x617b3f8050a0bd94b6b1da02b4384ee5b4df13f4',
            value: '0x0',
            data: '0x095ea7b3000000000000000000000000ec1adf982415d2ef5ec55899b9bfb8bc0f29251b000000000000000000000000000000000000000000000000016345785d8a0000',
            gas: '0xdaf1',
            gasPrice: '0x77359400',
          },
        },
      ],
    },
    confirmTransaction: {
      txData: {
        status: 'unapproved',
        id: 1,
        metamaskNetworkId: '66',
        txParams: {
          from: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
          to: '0x617b3f8050a0bd94b6b1da02b4384ee5b4df13f4',
          value: '0x0',
          data: '0x095ea7b3000000000000000000000000ec1adf982415d2ef5ec55899b9bfb8bc0f29251b000000000000000000000000000000000000000000000000016345785d8a0000',
          gas: '0xdaf1',
          gasPrice: '0x77359400',
        },
      },
      tokenProps: {
        tokenDecimals: '',
        tokenSymbol: '',
      },
      fiatTransactionTotal: '0.02',
      ethTransactionTotal: '0.000112',
      methodData: {},
      tokenData: {
        name: 'approve',
        params: [
          {
            name: '_spender',
            value: '0xec1adf982415d2ef5ec55899b9bfb8bc0f29251b',
            type: 'address',
          },
          {
            name: '_value',
            value: '100000000000000000',
            type: 'uint256',
          },
        ],
      },
    },
  }

  const store = configureMockStore([thunk])(mockStore)

  const props = {
    getNextNonce: sinon.stub(),
    tryReverseResolveAddress: sinon.stub(),
  }

  beforeEach(function () {

    wrapper = mountWithRouter(
      <Provider store={store}>
        <ConfirmApprove {...props} />
      </Provider>, store
    )
  })

  after(function () {
    sinon.restore()
  })

  it('renders', function () {
    assert.equal(wrapper.length, 1)
  })

  it('maps props from state', function () {

    assert.deepEqual(wrapper.find('ConfirmApprove').prop('txData'), mockStore.metamask.currentNetworkTxList[0])
    assert.equal(wrapper.find('ConfirmApprove').prop('toAddress'), '0xec1adf982415d2ef5ec55899b9bfb8bc0f29251b')
    assert.equal(wrapper.find('ConfirmApprove').prop('tokenAddress'), mockStore.confirmTransaction.txData.txParams.to)
    assert.equal(wrapper.find('ConfirmApprove').prop('tokenAmount'), mockStore.confirmTransaction.tokenData.params[1].value)
    assert.deepEqual(wrapper.find('ConfirmApprove').prop('token'), { address: mockStore.confirmTransaction.txData.txParams.to })
    assert.equal(wrapper.find('ConfirmApprove').prop('userAddress'), mockStore.metamask.selectedAddress)
    assert.equal(wrapper.find('ConfirmApprove').prop('data'), mockStore.confirmTransaction.txData.txParams.data)

  })

})
