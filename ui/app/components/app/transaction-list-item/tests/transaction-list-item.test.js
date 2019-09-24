import React from 'react'
import assert from 'assert'
// import sinon from 'sinon'
import { mountWithRouter } from '../../../../../../test/lib/render-helpers'
import TransactionListItem from '../index'

xdescribe('Transaction List Item', () => {
  let wrapper

  const props = {
  }

  beforeEach(() => {
    wrapper = mountWithRouter(
      <TransactionListItem.WrappedComponent {...props} />
    )
  })

  it('renders', () => {
    assert.equal(wrapper.length, 1)
  })
})

