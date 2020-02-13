import React from 'react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import sinon from 'sinon'
import assert from 'assert'

import { mountWithRouter } from '../../../../../test/lib/render-helpers'
import FirstTimeFlow from '../first-time-flow.container'

describe('First Time Flow', () => {
  let wrapper

  const mockStore = {
    metamask: {},
  }

  const store = configureStore()(mockStore)

  const props = {
    history: {
      push: sinon.spy(),
    },
  }

  before(() => {
    wrapper = mountWithRouter(
      <Provider store={store}>
        <FirstTimeFlow.WrappedComponent {...props} />
      </Provider>
    )
  })

  it('initially renders', () => {
    assert.equal(wrapper.length, 1)
    assert.equal(wrapper.find('Welcome').prop('location').pathname, '/initialize/welcome')
  })

  it('clicks Get Started button and routes to new component', () => {
    const getStartedButton = wrapper.find('.btn-primary.first-time-flow__button')

    getStartedButton.simulate('click')
    assert.equal(wrapper.find('SelectAction').prop('location').pathname, '/initialize/select-action')
  })

})
