import React from 'react'
import assert from 'assert'
import sinon from 'sinon'
import { shallow } from 'enzyme'
import ConfirmSendEther from '../confirm-send-ether.component'

describe('ConfirmSendToken', function () {

  let wrapper
  let handleEditSpy

  const props = {
    history: {
      push: sinon.spy(),
    },
    editTransaction: sinon.spy(),
  }

  const txParams = {
    from: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
    to: '0xec1adf982415d2ef5ec55899b9bfb8bc0f29251b',
    value: '0xde0b6b3a7640000',
    gas: '0x5208',
    gasPrice: '0x53724e00',
  }

  before(function () {
    handleEditSpy = sinon.spy(ConfirmSendEther.prototype, 'handleEdit')
  })

  beforeEach(function () {


    wrapper = shallow(
      <ConfirmSendEther {...props} />, {
        context: {
          t: (str) => str,
        },
      }
    )
  })

  after(function () {
    sinon.restore()
  })

  it('initializes with confirm as actionKey prop', function () {
    assert.equal(wrapper.prop('actionKey'), 'confirm')
  })

  it('sets txParams as a prop', function () {
    wrapper.setProps({ txParams })

    assert.equal(wrapper.instance().props.txParams, txParams)
  })

  it('calls editTransaction and navs to /send route', function () {

    wrapper.prop('onEdit')({ txData: 'txData' })

    assert(handleEditSpy.calledOnce)
    assert(props.editTransaction.calledOnce)
    assert(props.history.push.calledOnce)

    assert.equal(props.editTransaction.getCall(0).args[0], 'txData')
    assert.equal(props.history.push.getCall(0).args[0], '/send')

  })

  it('conditionally sets hideData boolean when txParams has data key', function () {
    Object.assign(txParams, { data: '0xData' })

    assert.equal(wrapper.prop('hideData'), true)

    wrapper.setProps({ txParams })
    wrapper.instance().shouldHideData()

    assert.equal(wrapper.prop('hideData'), false)
  })
})
