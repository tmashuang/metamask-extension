import React from 'react'
import assert from 'assert'
import sinon from 'sinon'
import { shallow } from 'enzyme'
import AddTokenButton from '../index'

describe('Add Token Button', function () {
  let wrapper, props

  beforeEach(function () {

    props = {
      onClick: sinon.spy(),
    }

    wrapper = shallow(
      <AddTokenButton {...props} />, {
        context: {
          t: (str) => str,
        }
      }
    )
  })

  afterEach(function () {
    sinon.restore()
  })

  it('renders', function () {
    assert.equal(wrapper.length, 1)
  })

  it('calls onClick prop function when clicking add token button', function () {
    const addTokenButton = wrapper.find('.add-token-button__button')

    addTokenButton.simulate('click')
    assert(props.onClick.calledOnce)
  })
})
