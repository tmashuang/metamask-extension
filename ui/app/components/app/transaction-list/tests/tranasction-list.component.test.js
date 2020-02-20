import React from 'react'
import assert from 'assert'
import sinon from 'sinon'
import { mountWithRouter } from '../../../../../../test/lib/render-helpers'
import TransactionList from '../transaction-list.component'

describe('Transaction List Component', () => {
  let wrapper

  const props = {
    updateNetworkNonce: sinon.stub().resolves(),
  }

  beforeEach(() => {
    wrapper = mountWithRouter(
      <TransactionList {...props} />
    )
  })

  it('renders empty transaction list', () => {
    const emptyList = wrapper.find('.transaction-list__empty')

    assert.equal(emptyList.length, 1)
  })
})
