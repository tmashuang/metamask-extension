import React from 'react'
import { Provider } from 'react-redux'
import assert from 'assert'
import configureMockStore from 'redux-mock-store'
import { mountWithRouter } from '../../../../../../test/lib/render-helpers'
import AssetList from '../index'

xdescribe('Asset List', function () {
  const mockStore = {
    metamask: {
      selectedAddress: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
      accounts: {
        '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc': {
          address: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
          balance: '0x0',
        },
      },
      cachedBalances: {
        101: {
          '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc': '0x0',
        },
      },
      preferences: {
        showFiatInTestnets: false,
      },
      provider: {
        type: 'test',
      },
      assetImages: {},
      network: '101',
      tokens: [],
    },
  }

  const store = configureMockStore()(mockStore)

  it('renders', function () {
    const wrapper = mountWithRouter(
      <Provider store={store}>
        <AssetList />
      </Provider>
    )

    assert.equal(wrapper.length, 1)
  })

})
