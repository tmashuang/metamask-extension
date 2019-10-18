import React from 'react'
import assert from 'assert'
import sinon from 'sinon'
import { mountWithRouter } from '../../../../../test/lib/render-helpers'
import Home from '../index'

xdescribe('Home', () => {
  let wrapper, originalMatchMedia

  const props = {
    history: {
      location: {
        pathname: '/',
      },
    },
  }

  beforeEach(() => {

    wrapper = mountWithRouter(
      <Home.WrappedComponent {...props} />
    )
  })

  afterEach(() => {
    window.matchMedia = originalMatchMedia
  })

  it('', () => {
    console.log(wrapper.debug)
  })
})
