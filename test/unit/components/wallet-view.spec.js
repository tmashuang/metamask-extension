import React from 'react'
import assert from 'assert'
import sinon from 'sinon'

import { Provider } from 'react-redux'
import { mountWithRouter } from '../../lib/render-helpers'
import configureStore from 'redux-mock-store'

import WalletView from '../../../ui/app/components/wallet-view'
import Identicon from '../../../ui/app/components/identicon'

describe('Wallet View', () => {
  let wrapper

  const mockState = {
    appState: {
      sidebar: {
        isOpen: true,
      },
    },
    metamask: {
      provider: {
        type: 'test',
      },
      useBlockie: false,
      network: 22,
      identities: {
        '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc': {
          address: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
          name: 'Account 1',
        },
      },
      tokens: [
        {
          'address': '0x617b3f8050a0bd94b6b1da02b4384ee5b4df13f4',
          'decimals': 18,
          'symbol': 'META',
        },
      ],
      keyrings: [
        {
          type: 'HD Key Tree',
          accounts: [
            '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
          ],
        },
      ],
      accounts: {
        '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc': {
          address: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
          // 1 ETH
          balance: '0xde0b6b3a7640000',
        },
      },
      cachedBalances: {
        22: {
          '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc': '0xde0b6b3a7640000',
        },
      },
      preferences: {
        useNativeCurrencyAsPrimaryCurrency: true,
      },
      selectedTokenAddress: null,
      selectedAddress: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
      currentCurrency: 'usd',
      conversionRate: '100.00',
    },
  }

  const props = {
    showSendPage: sinon.spy(),
    hideSidebar: sinon.spy(),
    unsetSelectedToken: sinon.spy(),
    showAccountDetailModal: sinon.spy(),
    showAddTokenPage: sinon.spy(),
  }

  const store = configureStore()(mockState)


  beforeEach(() => {
    wrapper = mountWithRouter(
      <Provider store={store}>
        <WalletView {...props}/>
      </Provider>
    )
  })

  describe('Wallet Balance', () => {
    it('simulates click to unset selected token', () => {
      wrapper.find('.wallet-balance').simulate('click')
      const actions = store.getActions()

      const actionsLength = actions.length
      assert.equal(actionsLength, 1) // redux store actions accumulates.

      assert.equal(actions[actionsLength - 1].type, 'SET_SELECTED_TOKEN')
      assert.equal(actions[actionsLength - 1].value, null)
    })

    it('displays eth balance from hex value in state', () => {
      const balance = wrapper.find('.currency-display-component.token-amount')
      assert.equal(balance.text(), '1ETH')
    })

    it('displays primary currency converted from eth value', () => {
      const test = wrapper.find('.currency-display-component')
      assert.equal(test.last().text(), '1ETH')
    })
  })

  describe('Account Detail', () => {
    it('simulates opening account modal when details is clicked', () => {
      const accountDetails = wrapper.find('div.flex-column.flex-center.wallet-view__name-container')
      accountDetails.simulate('click')
      const actions = store.getActions()

      const actionsLength = actions.length
      assert.equal(actionsLength, 2) // redux store actions accumulates.

      assert.equal(actions[actionsLength - 1].type, 'UI_MODAL_OPEN')
      assert.equal(actions[actionsLength - 1].payload.name, 'ACCOUNT_DETAILS')

    })
  })

  describe('Add Token', () => {
    xit('navigates to add-token url', () => {
      const addTokenButton = wrapper.find('.add-token-button__button')
      addTokenButton.simulate('click')
      const actions = store.getActions()

      const actionsLength = actions.length
      assert.equal(actionsLength, 3) // redux store actions accumulates.

      assert.equal(actions[actionsLength - 1].type, 'UI_SIDEBAR_CLOSE')
      assert.equal(wrapper.instance()._reactInternalInstance._context.router.history.location.pathname, '/add-token')
    })
  })

  describe('Identicon', () => {
    let identiconProps

    it('adjusts store address to checksum for Identicon ', () => {
      identiconProps = wrapper.find(Identicon).first().instance().selector.props
      assert.equal(identiconProps.address, '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc')
    })

    it('sets Identicon to blockie from store state', () => {
      assert.equal(identiconProps.useBlockie, false)
    })
  })

  describe('Button Wallet Address', () => {
    it('shows checksummed, shortened address', () => {
      const addressCopyButton = wrapper.find('.wallet-view__address')
      assert.equal(addressCopyButton.text(), '0x0dcd...e7bc')
    })

  })
})
