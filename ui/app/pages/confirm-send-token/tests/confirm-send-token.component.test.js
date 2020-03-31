import React from 'react'
import assert from 'assert'
import { shallow, mount } from 'enzyme'
import ConfirmSendToken from '../confirm-send-token.component'

// import proxyquire from 'proxyquire'
// const ConfirmSendToken = proxyquire('../confirm-send-token.component.js', {
//   '../confirm-token-transaction-base': {},
// }).default

describe.only('ConfirmSendToken', function () {
  it('t', function () {
    const wrapper = mount(
      <ConfirmSendToken />
    )

    assert.equal(wrapper.length, 1)
  })
})
