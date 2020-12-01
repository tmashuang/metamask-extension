import React from 'react'
import assert from 'assert'
import { shallow } from 'enzyme'
import CurrencyDisplay from '../currency-display.component'
import sinon from 'sinon'
import * as reactRedux from 'react-redux'

describe('CurrencyDisplay Component', () => {
  beforeEach(() => {
    const stub = sinon.stub(reactRedux, 'useSelector')
    stub.callsFake(() => ({
      currentCurrency: 'usd',
      nativeCurrency: 'ETH',
      conversionRate: 280.45,
    }))
  })
  it('should render text with a className', () => {
    const wrapper = shallow((
      <CurrencyDisplay
        displayValue="$123.45"
        className="currency-display"
        hideLabel
      />
    ))

    assert.ok(wrapper.hasClass('currency-display'))
    assert.equal(wrapper.text(), '$123.45')
  })

  it('should render text with a prefix', () => {
    const wrapper = shallow((
      <CurrencyDisplay
        displayValue="$123.45"
        className="currency-display"
        prefix="-"
        hideLabel
      />
    ))

    assert.ok(wrapper.hasClass('currency-display'))
    assert.equal(wrapper.text(), '-$123.45')
  })
  afterEach(() => {
    sinon.restore()
  })
})
