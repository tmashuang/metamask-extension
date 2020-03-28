import React from 'react'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import assert from 'assert'
import sinon from 'sinon'
import configureMockStore from 'redux-mock-store'
import { mountWithRouter } from '../../../../../test/lib/render-helpers'
import ConfirmSendEther from '../index'

xdescribe('Confirm Send Ether', function () {
  let wrapper

  const mockStore = {
    metamask: {
      ensResolutionsByAddress: {},
      addressBook: {},
      featureFlags: {
        'advancedInlineGas': false,
      },
      selectedAddress: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
      network: '66',
      cachedBalances: {
        '66': {
          '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc': '0xde0b6b3a7640000',
        },
      },
      accounts: {
        '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc': {
          address: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
          balance: '0xde0b6b3a7640000',
        },
      },
      identities: {
        '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc': {
          address: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
          name: 'Account 1',
        },
      },
      preferences: {},
      provider: {
        type: 'test',
      },
      unapprovedTxs: {
        1: {
          id: 1,
          status: 'unapproved',
          metamaskNetworkId: '66',
          txParams: {
            from: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
            to: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
            value: '0xde0b6b3a7640000',
            gas: '0x5208',
            gasPrice: '0x2540be400',
          },
        },
      },
      selectedAddressTxList: [
        {
          id: 1,
          status: 'unapproved',
          metamaskNetworkId: '66',
          txParams: {
            from: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
            to: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
            value: '0xde0b6b3a7640000',
            gas: '0x5208',
            gasPrice: '0x2540be400',
          },
        },
      ],
      assetImages: {},
    },
    confirmTransaction: {
      txData: {
        id: 1,
        metamaskNetworkId: '66',
        status: 'unapproved',
        txParams: {
          from: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
          to: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
          value: '0xde0b6b3a7640000',
          gas: '0x5208',
          gasPrice: '0x2540be400',
        },
      },
      methodData: {},
    },
    gas: {},
  }

  const store = configureMockStore([thunk])(mockStore)

  const props = {
    getNextNonce: sinon.stub(),
    tryReverseResolveAddress: sinon.stub(),
  }

  beforeEach(function () {
    wrapper = mountWithRouter(
      <Provider store={store}>
        <ConfirmSendEther {...props} />
      </Provider>
    )
  })

  it('', function () {
    assert.equal(wrapper.length, 1)
  })
})
