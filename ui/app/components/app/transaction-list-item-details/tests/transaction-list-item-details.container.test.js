import React from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import assert from 'assert'
import { shallow } from 'enzyme'
import TransactionListItemDetails from '../index'

describe('Transaction List Item Details', function () {

  const mockStore = {
    metamask: {
      currentCurrency: 'test',
      conversionRate: 1,
      provider: {
        type: 'test',
      },
      preferences: {
        showFiatInTestnets: false,
      },
      network: '66',
      ensResolutionsByAddress: '',
      addressBook: {},
    },
  }

  const store = configureMockStore([thunk])(mockStore)

  const props = {
    recipientAddress: '0x2',
    senderAddress: '0x1',
  }

  it('renders', function () {
    const wrapper = shallow(
      <TransactionListItemDetails store={store} {...props} />
    )
    console.log(wrapper.debug())
    assert.equal(wrapper.length, 1)
  })
})
