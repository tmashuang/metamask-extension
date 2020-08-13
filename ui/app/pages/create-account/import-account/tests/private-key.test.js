import React from 'react'
import assert from 'assert'
import sinon from 'sinon'
import configureStore from 'redux-mock-store'
import { mountWithRouter } from '../../../../../../test/lib/render-helpers'
import PrivateKeyImportView from '../private-key'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'

describe('PrivateKeyImportView', function () {

  let wrapper

  const mockState = {
    metamask: {
      network: '66',
      accounts: {
        '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc': {
          address: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
          balance: '0xde0b6b3a7640000',
        },
      },
      cachedBalances: {
        '66': {
          '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc': '0xde0b6b3a7640000',
        },
      },
    },
    appState: {
      warning: '',
    },
  }

  const store = configureStore([thunk])(mockState)

  beforeEach(function () {
    wrapper = mountWithRouter(
      <Provider store={store}>
        <PrivateKeyImportView />
      </Provider>
    )
  })

  it('', function () {
    assert.equal(wrapper.length, 1)
  })
})
