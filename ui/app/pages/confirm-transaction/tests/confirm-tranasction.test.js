import React from 'react'
import { Provider } from 'react-redux'
import assert from 'assert'
import sinon from 'sinon'
import configureMockStore from 'redux-mock-store'
import { mountWithRouter } from '../../../../../test/lib/render-helpers'
import ConfirmTransaction from '../index'

describe('Confirm Transaction', function () {
  let wrapper

  const mockStore = {
    metamask: {
      abTests: {
        fullScreenVsPopup: 'fullscreen',
      }
    },
  }

  const store = configureMockStore()(mockStore)

  const props = {
    history: {
      replace: sinon.spy(),
    },
    transactionId: '1',
    paramsTransactionId: '1',
  }


  beforeEach(function () {
    wrapper = mountWithRouter(
      <Provider store={store}>
        <ConfirmTransaction />
      </Provider>, store
    )
  })

  it('renders', function () {
    assert.equal(wrapper.length, 1)
  })

})
