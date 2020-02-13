import React from 'react'
import { Provider } from 'react-redux'
import assert from 'assert'
import sinon from 'sinon'
import configureMockStore from 'redux-mock-store'
import { mount, shallow } from 'enzyme'
import { mountWithRouter, shallowWithRouter } from '../../../../../../test/lib/render-helpers'
import TransactionList from '../index'
import thunk from 'redux-thunk'

describe.only('Transaction List', () => {
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

  const props = {
    updateNetworkNonce: sinon.stub().resolves(),
    fetchGasEstimates: sinon.stub(),
    fetchBasicGasAndTimeEstimates: sinon.stub(),
    pendingTransactions: [],
    completedTransactions: [],
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

  // it('', () => {
  //   console.log(wrapper.debug())
  // })

  it('renders', () => {
    assert.equal(wrapper.length, 1)
  })

  it('renders empty tranasction when no transactions in props', () => {
    const noTransactions = wrapper.find('.transaction-list__empty-text')

    assert.equal(noTransactions.length, 1)
  })

  it('', () => {
    wrapper.find('TransactionList').setProps({ pendingTransactions: [propTx1], completedTransactions: [propTx2] })

    console.log(wrapper.debug())
  })

})
