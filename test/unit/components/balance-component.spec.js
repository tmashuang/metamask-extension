import React from 'react'
import assert from 'assert'
import { createMockStore } from 'redux-test-utils'
import { mount } from 'enzyme'
import BalanceComponent from '../../../ui/app/components/balance-component'

const mockState = {
  metamask: {
    conversionRate: 115.45,
    currentCurrency: 'usd',
    preferences: {
      useNativeCurrencyAsPrimaryCurrency: true,
    },
    nativeCurrency: 'ETH',
    accounts: {
      '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc': {
        address: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
        // 1 ETH
        balance: '0xde0b6b3a7640000',
      },
    },
  },
}

const store = createMockStore(mockState)

describe('Balance Component', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(
      <BalanceComponent store={store}/>, {context: { store }}
    )
  })

  it('renders converted balance from hex', () => {
    assert.equal(wrapper.find('.currency-display-component.token-amount').text(), '1ETH')
  })

  it('renders converted eth balance as currency rate', () => {
    assert.equal(wrapper.find('.currency-display-component').last().text(), '$115.45USD')
  })
})
