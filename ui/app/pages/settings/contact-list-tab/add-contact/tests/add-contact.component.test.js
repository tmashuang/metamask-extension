import React from 'react'
import { Provider } from 'react-redux'
import assert from 'assert'
import sinon from 'sinon'
import configureStore from 'redux-mock-store'
import { mountWithRouter } from '../../../../../../../test/lib/render-helpers'

import { CONTACT_LIST_ROUTE } from '../../../../../helpers/constants/routes'
import AddContact from '../add-contact.component'

describe('Add Contact', function () {
  let wrapper, clock

  const address = '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc'
  const nickname = 'username'

  const mockState = {
    metamask: {
      network: '101',
      addressBook: {
        '101': {
          '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc': {
            address,
            chainId: '1',
            isEns: false,
            memo: '',
            name: 'test',
          },
        },
      },
      send: {
        to: '',
      },
    },
  }

  const store = configureStore()(mockState)

  const props = {
    addToAddressBook: sinon.stub(),
    history: {
      push: sinon.spy(),
    },
  }

  beforeEach(function () {
    clock = sinon.useFakeTimers()

    wrapper = mountWithRouter(
      <Provider store={store}>
        <AddContact {...props} />
      </Provider>
    )
  })

  afterEach(function () {
    clock.restore()
    props.history.push.resetHistory()
    props.addToAddressBook.resetHistory()
  })

  after(function () {
    sinon.restore()
  })

  it('changes newName in state on nickname input change', function () {
    const usernameInput = wrapper.find({ id: 'nickname' }).last()

    const event = { target: { value: nickname } }
    usernameInput.simulate('change', event)

    assert.equal(wrapper.find('AddContact').state('newName'), nickname)
  })

  it('changes ethAddress in state on address input change', function () {
    const addressInput = wrapper.find('.ens-input__wrapper__input')

    const event = { target: { value: address } }
    addressInput.simulate('change', event)

    clock.tick(1000)
    assert.equal(wrapper.find('AddContact').state('ethAddress'), address)
  })

  it('reset', function () {
    const addressInput = wrapper.find('.ens-input__wrapper__input')

    const addressEvent = { target: { value: address } }
    addressInput.simulate('change', addressEvent)
    clock.tick(1000)

    assert.equal(wrapper.find('AddContact').state('ethAddress'), address)

    wrapper.find('.send__to-row').at(1).prop('onReset')()

    assert.equal(wrapper.find('AddContact').state('ethAddress'), '')


  })

  it('submits', function () {
    const usernameInput = wrapper.find({ id: 'nickname' }).last()
    const addressInput = wrapper.find('.ens-input__wrapper__input')

    const usernameEvent = { target: { value: nickname } }
    const addressEvent = { target: { value: address } }

    usernameInput.simulate('change', usernameEvent)
    addressInput.simulate('change', addressEvent)

    clock.tick(1000)
    const submitButton = wrapper.find('.btn-primary.page-container__footer-button')
    submitButton.simulate('click')

    assert(props.addToAddressBook.calledOnce)

    assert.deepEqual(props.addToAddressBook.getCall(0).args,
      [address, nickname]
    )

    assert.equal(props.history.push.getCall(0).args[0], CONTACT_LIST_ROUTE)
  })

  it('errors bad address', function () {
    const addressInput = wrapper.find('.ens-input__wrapper__input')

    const event = { target: { value: 'random address' } }
    addressInput.simulate('change', event)

    clock.tick(1000)
    assert(wrapper.find('AddContact').state('error'), 'Invalid Address')
  })

  it('routes to contact list when clicking cancel', function () {
    const cancelButton = wrapper.find('.btn-default.page-container__footer-button')

    cancelButton.simulate('click')
    assert(props.history.push.calledOnce)
    assert.equal(props.history.push.getCall(0).args[0], CONTACT_LIST_ROUTE)

  })
})
