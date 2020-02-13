import React from 'react'
import { PropTypes } from 'prop-types'
import configureMockStore from 'redux-mock-store'
import assert from 'assert'
import { mount } from 'enzyme'
import DepositEtherModal from '../index'

describe('Deposit Ether Modal Container', () => {
  let wrapper

  const mockStore = {
    metamask: {},
  }

  const store = configureMockStore()(mockStore)

  const props = {
    network: '1',
    address: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
  }

  beforeEach(() => {
    wrapper = mount(
      <DepositEtherModal {...props} store={store} />, {
        context: {
          t: str => str,
        },
        childContextTypes: {
          t: PropTypes.func,
        },
      }
    )
  })

  it('renders', () => {
    assert.equal(wrapper.length, 1)
  })
})
