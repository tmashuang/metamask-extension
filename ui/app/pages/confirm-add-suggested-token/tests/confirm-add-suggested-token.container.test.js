import React from 'react'
import { Provider } from 'react-redux'
import assert from 'assert'
import configureStore from 'redux-mock-store'
import { mountWithRouter } from '../../../../../test/lib/render-helpers'
import ConfirmAddSuggestedToken from '../index'

describe('Confirm Add Suggested Token', function () {

  let wrapper

  const metaToken = {
    address: '0x617b3f8050a0bd94b6b1da02b4384ee5b4df13f4',
    symbol: 'META',
    decimals: 18,
  }

  const mockState = {
    metamask: {
      selectedAddress: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
      currentCurrency: 'foo',
      conversionRate: 1,
      pendingTokens: {},
      suggestedTokens: {
        '0x617b3f8050a0bd94b6b1da02b4384ee5b4df13f4': metaToken,
      },
      tokens: [],
    },
  }

  const store = configureStore()(mockState)

  before(function () {
    wrapper = mountWithRouter(
      <Provider store={store}>
        <ConfirmAddSuggestedToken />
      </Provider>
    )
  })

  it('renders', function () {
    assert.equal(wrapper.length, 1)
  })

  it('sets pendingTokens prop from suggestdTokens state', function () {
    assert.deepEqual(
      wrapper.find('ConfirmAddSuggestedToken').prop('pendingTokens'),
      mockState.metamask.suggestedTokens
    )
  })

})
