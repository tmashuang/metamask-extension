import React from 'react'
import { Provider } from 'react-redux'
import sinon from 'sinon'
import assert from 'assert'
import configureMockStore from 'redux-mock-store'
import { mountWithRouter } from '../../../../../../test/lib/render-helpers'
import proxyquire from 'proxyquire'

const clipboardSpy = sinon.spy()

const TransactionListItemDetails = proxyquire('../transaction-list-item-details.component.js', {
  'copy-to-clipboard': clipboardSpy,
}).default

describe('TransactionListItemDetails clicking props', function () {

  let wrapper

  const openWindowSpy = sinon.spy()

  const transaction = {
    history: [],
    hash: '0xHash',
    metamaskNetworkId: '4',
    id: 101,
    status: 'confirmed',
    txParams: {
      from: '0x1',
      gas: '0x5208',
      gasPrice: '0x3b9aca00',
      nonce: '0xa4',
      to: '0x2',
      value: '0x2386f26fc10000',
    },
  }


  const transactionGroup = {
    transactions: [transaction],
    primaryTransaction: transaction,
    initialTransaction: transaction,
  }


  const props = {
    transactionGroup,
    recipientAddress: '0x2',
    senderAddress: '0x1',
    tryReverseResolveAddress: sinon.stub(),
    onCancel: sinon.spy(),
    onRetry: sinon.spy(),
    senderNickname: '',
    recipientNickname: '',
    showSpeedUp: true,
    showRetry: true,
    cancelDisabled: false,
    showCancel: true,
  }

  const mockStore = {
    metamask: {
      currentCurrency: 'test',
      conversionRate: 1,
      provider: {
        type: 'test',
      },
      preferences: {
        showFiatInTestnets: false,
      },
    },
  }

  const store = configureMockStore()(mockStore)

  beforeEach(function () {

    global.platform = { openWindow: openWindowSpy }

    wrapper = mountWithRouter(
      <Provider store={store}>
        <TransactionListItemDetails {...props} />, {},
      </Provider>
    )
  })

  afterEach(function () {
    props.onRetry.resetHistory()
    props.onCancel.resetHistory()
  })

  after(function () {
    sinon.restore()
  })

  it('calls onRetry from props with transaction id when speed up button is clicked', function () {
    const buttons = wrapper.find('.transaction-list-item-details__header-button')
    const speedUp = buttons.at(1)

    speedUp.simulate('click')

    assert(props.onRetry.calledOnce)
    assert.equal(props.onRetry.getCall(0).args[0], transaction.id)
  })


  it('calls onCancel from props with transaction id when cancel button is clicked', function () {
    const buttons = wrapper.find('.transaction-list-item-details__header-button')
    const cancel = buttons.at(3)

    cancel.simulate('click')

    assert(props.onCancel.calledOnce)
    assert.equal(props.onCancel.getCall(0).args[0], transaction.id)
  })

  it('calls copyToClipboard with transaction hash', function () {
    const buttons = wrapper.find('.transaction-list-item-details__header-button')
    const copyTxHash = buttons.at(5)

    copyTxHash.simulate('click')

    assert(clipboardSpy.calledOnce)
    assert.equal(clipboardSpy.getCall(0).args[0], transaction.hash)
  })

  it('clicks etherscan copy icon to open window', function () {
    const buttons = wrapper.find('.transaction-list-item-details__header-button')
    const etherscan = buttons.at(7)

    etherscan.simulate('click')

    assert(openWindowSpy.calledOnce)
    assert.equal(openWindowSpy.getCall(0).args[0].url, 'https://rinkeby.etherscan.io/tx/0xHash')
  })

})
