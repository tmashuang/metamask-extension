import React from 'react'
import assert from 'assert'
import sinon from 'sinon'
import { mountWithRouter } from '../../../../../test/lib/render-helpers'
import NewAccountCreateForm from '../new-account.container'

describe('New Account', function () {
  let wrapper

  const props = {
    history: {
      push: sinon.spy(),
    },
    createAccount: sinon.stub().resolves(),
  }

  beforeEach(function () {
    wrapper = mountWithRouter(
      <NewAccountCreateForm.WrappedComponent {...props} />
    )
  })

  afterEach(function () {
    props.history.push.resetHistory()
    props.createAccount.resetHistory()
  })

  it('changes account name in state from input', function () {
    const newAccountInput = wrapper.find('.new-account-create-form__input')
    const newAccountName = 'New Account'

    newAccountInput.simulate('change', { target: { value: newAccountName } })
    assert(wrapper.find('NewAccountCreateForm').state('newAccountName'), newAccountName)
  })

  it('clicks cancel button to return to default (/) route', function () {
    const cancelButton = wrapper.find('.btn-default')

    cancelButton.simulate('click')
    assert(props.history.push.calledOnce)
    assert.equal(props.history.push.getCall(0).args[0], '/')
  })

  it('clicks create account button and defaults account name', function () {
    const createButton = wrapper.find('.btn-secondary')

    createButton.simulate('click')
    assert(props.createAccount.calledOnce)
    assert.equal(props.createAccount.getCall(0).args[0], 'newAccountNumberName')
  })

  it('changes account name and submits it with a custom account name', function () {
    const newAccountInput = wrapper.find('.new-account-create-form__input')
    const newAccountName = 'New Account'

    newAccountInput.simulate('change', { target: { value: newAccountName } })

    const createButton = wrapper.find('.btn-secondary')

    createButton.simulate('click')
    assert.equal(props.createAccount.getCall(0).args[0], newAccountName)
  })
})
