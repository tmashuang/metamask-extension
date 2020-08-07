import React from 'react'
import assert from 'assert'
import { mountWithStore } from '../../../../../../test/lib/render-helpers'
import configureMockStore from 'redux-mock-store'

import Alerts from '../index'
import UnconnectedAccountAlert from '../unconnected-account-alert'

describe('Alerts', function () {

  const network = '123'

  const selectedAddress = '0xec1adf982415d2ef5ec55899b9bfb8bc0f29251b'

  const identities = {
    '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc': {
      address: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
      name: 'Accouunt 1',
    },
  }

  const accounts = {
    '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc': {
      address: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
      balance: '0x0',
    },
  }

  const cachedBalances = {
    '123': {
      '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc': '0x0',
    },
  }

  const keyrings = [
    {
      type: 'HD Key Tree',
      accounts: [
        '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
      ],
    },
  ]

  it('renders null when switchToConnected and unconnectedAccount state is closed', function () {

    const mockStore = {
      unconnectedAccount: {
        state: 'CLOSED',
      },
    }

    const store = configureMockStore()(mockStore)

    const wrapper = mountWithStore(
      <Alerts />, store
    )

    assert.equal(wrapper.find(Alerts).html(), null)
  })

  it('renders <UnconnectedAccountAlert /> when unconnectedAccount is open', function () {

    const mockStore = {
      metamask: {
        identities,
        keyrings,
        accounts,
        cachedBalances,
        network,
        selectedAddress,
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
        state: 'CLOSED',
      },
    }

    const openUnconnectedAccounts = {
      unconnectedAccount: {
        state: 'OPEN',
      },
    }

    const updatedStore = { ...mockStore, ...openUnconnectedAccounts }

    const store = configureMockStore()(updatedStore)

    const wrapper = mountWithStore(
      <Alerts />, store
    )

    assert.equal(wrapper.find(UnconnectedAccountAlert).length, 1)
  })

})
