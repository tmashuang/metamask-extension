import React from 'react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import assert from 'assert'
import { mountWithRouter } from '../../../../../test/lib/render-helpers'
import ConfirmAddToken from '../index'

describe('Confirm Add Token', function () {
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
      pendingTokens: {
        '0x617b3f8050a0bd94b6b1da02b4384ee5b4df13f4': metaToken,
      },
    },
  }

  const store = configureStore()(mockState)

  beforeEach(function () {
    wrapper = mountWithRouter(
      <Provider store={store}>
        <ConfirmAddToken />,
      </Provider>
    )
  })

  it('renders', function () {
    assert.equal(wrapper.length, 1)
  })

  it('sets pendingTokens prop from suggestdTokens state', function () {
    assert.deepEqual(
      wrapper.find('ConfirmAddToken').prop('pendingTokens'),
      mockState.metamask.pendingTokens
    )
  })
})
