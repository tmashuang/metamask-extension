import React from 'react'
import assert from 'assert'
import { createMockStore } from 'redux-test-utils'
import { mount } from 'enzyme'

import AddToken from '../add-token.component'
import Tab from '../../../tabs/tab'

describe('Add Token', () => {
  let wrapper

  const mockStore = {
    metamask: {
      tokens: [],
    },
  }

  const store = createMockStore(mockStore)

  beforeEach(() => {
    wrapper = mount(
      <AddToken />, { context: { t: str => str + '_t', store }, childContextTypes: { store } }
    )
  })

  it('renders two tabs for search and custom tokens', () => {
    assert.equal(wrapper.find(Tab).length, 2)
  })

  describe('Search Tab', () => {
    it('sets search tab to active first', () => {
      assert.equal(wrapper.find(Tab).first().prop('name'), 'search_t')
      assert.equal(wrapper.find(Tab).first().prop('isActive'), true)
    })

    it('finds search token classname', () => {
      assert(wrapper.find('.add-token__search-token'))
    })
  })

  describe('Custom Token Tab', () => {
    it('sets active tab when clicked', () => {
      assert.equal(wrapper.find(Tab).last().prop('isActive'), false)
      wrapper.find(Tab).last().simulate('click')
      assert.equal(wrapper.find(Tab).last().prop('isActive'), true)
    })

    it('finds custom token form', () => {
      wrapper.find(Tab).last().simulate('click')
      assert(wrapper.find('.add-token__custom-token-form'))
    })
  })
})
