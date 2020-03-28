import React from 'react'
import assert from 'assert'
import sinon from 'sinon'
import { mountWithRouter } from '../../../../../../../test/lib/render-helpers'
import AddToAddressBookModal from '../index'

describe('Add To Addressbook', function () {
  let wrapper

  const props = {
    hideModal: sinon.spy(),
    addToAddressBook: sinon.spy(),
    recipient: '0xAddress',
  }

  beforeEach(function () {
    wrapper = mountWithRouter(
      <AddToAddressBookModal.WrappedComponent {...props} />
    )
  })

  afterEach(function () {
    props.hideModal.resetHistory()
  })

  after(function () {
    sinon.restore()
  })

  it('adds alias, clicks save, and calls addToAddressBook with recipient and alias', function () {
    const aliasInput = wrapper.find('.add-to-address-book-modal__input')

    const event = { target: { value: 'Account Alias' } }
    aliasInput.simulate('change', event)

    const saveButton = wrapper.find('.add-to-address-book-modal__footer .btn-primary')
    saveButton.simulate('click')

    assert(props.addToAddressBook.calledOnce)
    assert.deepEqual(
      props.addToAddressBook.getCall(0).args,
      [props.recipient, event.target.value]
    )
    assert(props.hideModal.calledOnce)

  })

  it('hides modal when clicking cancel', function () {
    const cancelButton = wrapper.find('.add-to-address-book-modal__footer .btn-secondary')

    cancelButton.simulate('click')

    assert(props.hideModal.calledOnce)
  })


})
