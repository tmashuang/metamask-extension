import React from 'react'
import assert from 'assert'
import sinon from 'sinon'
import { mountWithRouter } from '../../../../../../../test/lib/render-helpers'
import NewAccountModal from '../index'

describe('NewAccountModal', () => {
  let wrapper

  const props = {
    hideModal: sinon.spy(),
    newAccountNumber: 2,
    onSave: sinon.stub().resolves(),
  }

  beforeEach(() => {
    wrapper = mountWithRouter(
      <NewAccountModal.WrappedComponent {...props} />
    )
  })

  afterEach(() => {
    props.onSave.resetHistory()
    props.hideModal.resetHistory()
  })

  it('changes account name to enable save button to click and calls onSave with alias', () => {
    const alias = 'Account Name'
    const accountInput = wrapper.find('.new-account-modal__input')

    const event = { target: { value: alias } }
    accountInput.simulate('change', event)

    const saveButton = wrapper.find('.button.btn-primary')
    saveButton.simulate('click')

    setImmediate(() => {
      assert(props.onSave.calledOnce)
      assert.equal(props.onSave.getCall(0).args[0], alias)
      assert(props.hideModal.calledOnce)
    })

  })

  it('changes account name but key press Enter to call onSave with alias', () => {
    const alias = 'Account Name'
    const accountInput = wrapper.find('.new-account-modal__input')

    const event = { target: { value: alias } }

    accountInput.simulate('change', event)
    accountInput.simulate('keypress', { key: 'Enter' })

    setImmediate(() => {
      assert(props.onSave.calledOnce)
      assert.equal(props.onSave.getCall(0).args[0], alias)
      assert(props.hideModal.calledOnce)
    })

  })

})
