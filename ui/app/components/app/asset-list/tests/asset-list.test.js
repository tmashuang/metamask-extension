import React from 'react'
import assert from 'assert'
import sinon from 'sinon'
import { mountWithStoreAndRouter, mountWithStore, mountWithRouterHook } from '../../../../../../test/lib/render-helpers'
import configureMockStore from 'redux-mock-store'

import { ADD_TOKEN_ROUTE } from '../../../../helpers/constants/routes'
import AssetList from '../asset-list'

describe('Asset List', function () {

  const network = '123'

  const provider = {
    type: 'test',
  }

  const preferences = {
    showFiatInTestnets: true,
  }

  const currentCurrency = 'usd'

  const conversionRate = 123

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

  const cachedBalances = {
    '123': {
      '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc': '0x0',
      '0xec1adf982415d2ef5ec55899b9bfb8bc0f29251b': '0x0',
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

  after(function () {
    sinon.restore()
  })

  it('render', function () {

    const mockStore = {
      metamask: {
        network,
        provider,
        preferences,
        conversionRate,
        currentCurrency,
        selectedAddress,
        identities,
        accounts,
        cachedBalances,
      },
    }

    const store = configureMockStore()(mockStore)

    const props = {
      onClickAsset: sinon.stub(),
    }

    const wrapper = mountWithRouterHook(
      <AssetList store={store} {...props} />,
    )

    assert.equal(wrapper.find(AssetList).length, 1)
  })

  it('clicks add token button to navigate to add token path', function () {

    const mockStore = {
      metamask: {
        network,
        provider,
        preferences,
        conversionRate,
        currentCurrency,
        selectedAddress,
        identities,
        accounts,
        cachedBalances,
      },
    }

    const store = configureMockStore()(mockStore)

    const history = { push: sinon.spy(), location: {}, listen: sinon.stub() }

    const props = {
      onClickAsset: sinon.stub(),
    }

    const wrapper = mountWithRouterHook(
      <AssetList store={store} {...props} />, history,
    )

    const addTokenButton = wrapper.find('button.add-token-button__button')
    addTokenButton.simulate('click')

    assert(history.push.calledOnce)
    assert.equal(history.push.getCall(0).args[0], ADD_TOKEN_ROUTE)
  })
})
