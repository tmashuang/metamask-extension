import React from 'react'
import assert from 'assert'
import sinon from 'sinon'
import { shallow } from 'enzyme'
import ConfirmSendToken from '../confirm-send-token.component'

describe('ConfirmSendToken', function () {

  let wrapper
  let handleEditSpy

  const props = {
    history: {
      push: sinon.spy(),
    },
    editTransaction: sinon.spy(),
  }

  before(function () {
    handleEditSpy = sinon.spy(ConfirmSendToken.prototype, 'handleEdit')
  })

  beforeEach(function () {


    wrapper = shallow(
      <ConfirmSendToken {...props} />
    )
  })

  after(function () {
    sinon.restore()
  })

  it('render', function () {
    assert.equal(wrapper.length, 1)
  })

  it('sets token amount as prop', function () {
    const tokenAmount = 1000000000000000000
    wrapper.setProps({ tokenAmount })

    assert.equal(wrapper.prop('tokenAmount'), tokenAmount)
  })

  it('calls editTransaction and navs to /send route', function () {
    wrapper.prop('onEdit')('confirmTransactionData')

    assert(handleEditSpy.calledOnce)
    assert(props.editTransaction.calledOnce)
    assert(props.history.push.calledOnce)

    assert.equal(props.editTransaction.getCall(0).args[0], 'confirmTransactionData')
    assert.equal(props.history.push.getCall(0).args[0], '/send')

  })
})
