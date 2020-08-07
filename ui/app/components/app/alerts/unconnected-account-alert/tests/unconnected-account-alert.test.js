import assert from 'assert'
import sinon from 'sinon'

import React from 'react'

import { mountWithStore } from '../../../../../../../test/lib/render-helpers'
import configureMockStore from 'redux-mock-store'

import UnconnectedAccountAlert from '../index'
import CheckBox from '../../../../ui/check-box'

describe('Unconnected Account Alert', function () {

  const network = '123'

  const selectedAddress = '0xec1adf982415d2ef5ec55899b9bfb8bc0f29251b'

  const identities = {
    '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc': {
      address: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
      name: 'Accouunt 1',
    },
    '0xec1adf982415d2ef5ec55899b9bfb8bc0f29251b': {
      address: '0xec1adf982415d2ef5ec55899b9bfb8bc0f29251b',
      name: 'Account 2',
    },
  }

  const accounts = {
    '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc': {
      address: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
      balance: '0x0',
    },
    '0xec1adf982415d2ef5ec55899b9bfb8bc0f29251b': {
      address: '0xec1adf982415d2ef5ec55899b9bfb8bc0f29251b',
      balance: '0x0',
    },
  }

  const cachedBalances = {
    '123': {
      '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc': '0x0',
      '0xec1adf982415d2ef5ec55899b9bfb8bc0f29251b': '0x0',
    },
  }

  const keyrings = [
    {
      type: 'HD Key Tree',
      accouunts: [
        '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
        '0xec1adf982415d2ef5ec55899b9bfb8bc0f29251b',
      ],
    },
  ]

  const mockStore = {
    metamask: {
      network,
      selectedAddress,
      identities,
      accounts,
      cachedBalances,
      keyrings,
      permissionsHistory: {
        'https://test.dapp': {
          'eth_accounts': {
            accounts: {
              '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc': 1596681857076,
            },
          },
        },
      },
      domains: {
        'https://test.dapp': {
          permissions: [
            {
              caveats: [
                {
                  name: 'primaryAccountOnly',
                  type: 'limitResponseLength',
                  value: 1,
                },
                {
                  name: 'exposedAccounts',
                  type: 'filterResponse',
                  value: [
                    '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
                  ],
                },
              ],
              invoker: 'https://app.uniswap.org',
              parentCapability: 'eth_accounts',
            },
          ],
        },
      },
    },
    activeTab: {
      origin: 'https://test.dapp',
    },
    unconnectedAccount: {
      state: 'OPEN',
    },
  }

  afterEach(function () {
    sinon.restore()
  })

  it('render failure message when unconnectedAccount state is ERROR', function () {
    const unconnectedAccountState = {
      unconnectedAccount: {
        state: 'ERROR',
      },
    }
    const erroredMockStore = { ...mockStore, ...unconnectedAccountState }

    const store = configureMockStore()(erroredMockStore)

    const wrapper = mountWithStore(
      <UnconnectedAccountAlert />, store
    )

    assert.equal(wrapper.find('.unconnected-account-alert__error').length, 1)
    assert.equal(wrapper.find('.unconnected-account-alert__error').text(), '[failureMessage]')
  })

  it('checks the checkbox and changes checked state', function () {

    const store = configureMockStore()(mockStore)

    const wrapper = mountWithStore(
      <UnconnectedAccountAlert />, store
    )

    const checkbox = wrapper.find('input.unconnected-account-alert__checkbox')

    assert.equal(wrapper.find(CheckBox).prop('checked'), false)
    checkbox.simulate('click')
    assert.equal(wrapper.find(CheckBox).prop('checked'), true)
  })

  it('clicks dismiss button', function () {

    const store = configureMockStore()(mockStore)

    sinon.spy(store, 'dispatch')

    const wrapper = mountWithStore(
      <UnconnectedAccountAlert />, store
    )

    const dismissButton = wrapper.find('button.unconnected-account-alert__dismiss-button')
    dismissButton.simulate('click')

    assert(store.dispatch.calledOnce)
    assert.equal(store.dispatch.getCall(0).args[0].type, 'unconnectedAccount/dismissAlert')
  })

})
