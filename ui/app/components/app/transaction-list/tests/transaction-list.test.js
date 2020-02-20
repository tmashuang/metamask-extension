import React from 'react'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import assert from 'assert'
import sinon from 'sinon'
import configureMockStore from 'redux-mock-store'
import { mountWithRouter } from '../../../../../../test/lib/render-helpers'
import TransactionList from '../index'

describe('Transaction List', () => {
  let wrapper

  const propTx1 = {
    nonce: '0x0',
    tranasctions: [],
    initialTransaction: {},
    primaryTransaction: {},
  }

  const propTx2 = {
    nonce: '0x1',
    tranasctions: [],
    initialTransaction: {},
    primaryTransaction: {},
  }

  const blockTime = 'mockBlockTime'

  const props = {
    updateNetworkNonce: sinon.stub().resolves(),
    fetchGasEstimates: sinon.stub().resolves(),
    fetchBasicGasAndTimeEstimates: sinon.stub().resolves({ blockTime }),
    pendingTransactions: [propTx1],
    completedTransactions: [propTx2],
    transactionTimeFeatureActive: true,
  }

  const mockStore = {
    metamask: {
      slectedAddress: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
      network: 101,
      featureFlags: {
        showIncomingTransactions: false,
      },
      cachedBalances: {
        101: {
          '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc': '0x0',
        },
      },
      accounts: {
        '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc': {
          address: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
          balance: '0x0',
        },
      },
      preferences: {
        showFiatInTestnets: false,
      },
      provider: {
        type: 'rpc',
      },
      frequentRpcListDetail: [
        {
          rpcUrl: 'HTTP://127.0.0.1:7545',
          ticker: 'ETH',
          nickname: 'ganache',
          rpcPrefs: {},
        },
      ],
    },
  }

  const store = configureMockStore([thunk])(mockStore)

  before(() => {
    global.ethQuery = {
      getTransactionCount: sinon.stub(),
    }
  })

  beforeEach(() => {
    wrapper = mountWithRouter(
      <Provider store={store}>
        <TransactionList {...props} />
      </Provider>
    )
  })

  after(() => {
    sinon.restore()
  })


  it('renders and calls fetchBasicGasAndTimeEstimates/fetchGasEstimates for blockTime on mount', () => {
    assert.equal(wrapper.length, 1)

    setImmediate(() => {
      assert(props.fetchBasicGasAndTimeEstimates.calledOnce)
      assert(props.fetchGasEstimates.calledOnce)
      assert.equal(props.fetchGasEstimates.getCall(0).args[0], blockTime)
    })
  })


})
