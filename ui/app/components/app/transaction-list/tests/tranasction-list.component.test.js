import React from 'react'
import assert from 'assert'
import sinon from 'sinon'
import { mountWithRouter } from '../../../../../../test/lib/render-helpers'
import TransactionList from '../transaction-list.component'

describe('Transaction List Component', function () {
  let wrapper

  const props = {
    isWideViewport: false,
    updateNetworkNonce: sinon.stub().resolves(),
  }

  beforeEach(function () {
    wrapper = mountWithRouter(
      <TransactionList {...props} />
    )
  })

  after(function () {
    sinon.restore()
  })

  it('renders empty transaction list', function () {
    const emptyList = wrapper.find('.transaction-list__empty')

    assert.equal(emptyList.length, 1)
  })

})
