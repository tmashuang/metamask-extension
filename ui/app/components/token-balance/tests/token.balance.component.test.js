import React from 'react'
import assert from 'assert'
import { shallow } from 'enzyme'
import TokenBalance from '../token-balance.component.js'
import CurrencyDisplay from '../../currency-display'

describe('Token Balance', () => {
  let wrapper, props

  beforeEach(() => {
    props = {
      string: '100',
      symbol: 'test',
      className: 'transaction-view-balance__token-balance',
    }

    wrapper = shallow(<TokenBalance
      {...props}
      withSymbol = {true}
      error = {null}
    />)
  })

  it('renders child component', () => {
    assert.equal(wrapper.find(CurrencyDisplay).length, 1)
  })

  it('passes classname prop to child component', () => {
    assert.equal(wrapper.find(CurrencyDisplay).prop('className'), props.className)
  })

  it('passes string prop to child component as displayValue', () => {
    assert.equal(wrapper.find(CurrencyDisplay).prop('displayValue'), props.string)
  })

  it('passes symbol prop to child component as suffix', () => {
    assert.equal(wrapper.find(CurrencyDisplay).prop('suffix'), props.symbol)
  })
})
