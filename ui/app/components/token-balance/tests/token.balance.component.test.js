import React from 'react'
import assert from 'assert'
import { shallow } from 'enzyme'
import TokenBalance from '../token-balance.component.js'

describe('Token Balance', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallow(<TokenBalance
      userAddress = {'0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc'}
      string = {'100'}
      symbol = {'test'}
      withSymbol = {true}
      className = {'transaction-view-balance__token-balance'}
      error = {null}
    />)
  })

  it('base html class without props', () => {
    assert.equal(wrapper.find('.hide-text-overflow').length, 1)
  })

  it('changes the html based on props', () => {
    assert.equal(wrapper.html(), '<div class="hide-text-overflow transaction-view-balance__token-balance">100 test</div>')
  })
})
