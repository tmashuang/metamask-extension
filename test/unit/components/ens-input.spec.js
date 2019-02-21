import React from 'react'
import assert from 'assert'
import sinon from 'sinon'
import { createMockStore } from 'redux-test-utils'
import { shallow, mount } from 'enzyme'
import EnsInput from '../../.../../../ui/app/components/ens-input'

xdescribe('EnsInput Component', () => {
  let wrapper

  const mockState = {
    metamask: {
      accounts: {

      },
    },
  }

  const store = createMockStore(mockState)
  const onChangeSpy = sinon.spy()
  const props = {
    onChange: onChangeSpy,
  }

  beforeEach(() => {
    wrapper = mount(<EnsInput store={store} {...props} />, { context: {t: str => str + '_t' }, childContextTypes: {t: () => {} }})
  })

  xit('', () => {
    console.log(wrapper.debug())
  })

  xit('', () => {
    console.log(wrapper.props())
  })


  it('', () => {
    const event = {target: {value: 'test account'}}
    // const input = wrapper.find('input')
    // input.simulate('focus')
    // input.simulate('change', event)
    wrapper.find('input').simulate('change', event)
    // wrapper.update()
    // wrapper.find('input').prop('onChange')({target: {value: 'fuck'}})
    wrapper.update()
    console.log(wrapper.debug())
  })
})
