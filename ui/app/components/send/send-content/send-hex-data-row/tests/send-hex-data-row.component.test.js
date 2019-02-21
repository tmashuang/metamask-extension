import React from 'react'
import assert from 'assert'
import sinon from 'sinon'
import { mount } from 'enzyme'
import SendHexDataRow from '../send-hex-data-row.component'

describe('SendHexDataRow', () => {
  let wrapper

  const props = {
    updateSendHexData: sinon.spy(),
    updateGas: sinon.spy(),
  }

  beforeEach(() => {
    wrapper = mount(
      <SendHexDataRow {...props} />, { context: { t: str => str + '_t' }}
    )
  })

  it('simulates input with data', () => {
    const event = {target: {value: '0xData'}}

    wrapper.find('textarea').simulate('input', event)

    assert.equal(props.updateSendHexData.callCount, 1)
    assert.equal(props.updateGas.callCount, 1)

    assert(props.updateGas.calledWith({data: '0xData'}))
    assert(props.updateSendHexData.calledWith('0xData'))

  })
})
