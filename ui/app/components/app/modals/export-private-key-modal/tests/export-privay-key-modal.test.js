import React from 'react'
import { Provider } from 'react-redux'
import assert from 'assert'
import sinon from 'sinon'
import configureStore from 'redux-mock-store'
import { mountWithRouter } from '../../../../../../../test/lib/render-helpers'
import ExportPrivateKeyModal from '../index'

describe('ExportPrivateKeyModal', () => {
  let wrapper

  const mockStore = {
    metamask: {},
  }

  const props = {
    selectedIdentity: {
      address: '0xAddress',
      name: 'Account 1',
    },
    exportAccount: sinon.stub().resolves('Private Key'),
    showAccountDetailModal: sinon.spy(),
    hideModal: sinon.spy(),
    previousModalState: 'ACCOUNT_DETAILS',
  }

  const store = configureStore()(mockStore)

  beforeEach(() => {
    wrapper = mountWithRouter(
      <Provider store={store}>
        <ExportPrivateKeyModal.WrappedComponent {...props} />
      </Provider>
    )
  })

  afterEach(() => {
    props.exportAccount.resetHistory()
  })

  after(() => {
    sinon.restore()
  })

  it('renders', () => {
    assert.equal(wrapper.length, 1)
  })

  it('inputs password to field and returns a private key', async () => {
    const passwordField = wrapper.find('.private-key-password-input')
    const event = { target: { value: 'a-password' } }
    passwordField.simulate('change', event)

    const confirmButton = wrapper.find('.btn-secondary.export-private-key__button')
    confirmButton.simulate('click')

    assert(props.exportAccount.calledOnce)

    setImmediate(() => {
      assert.equal(
        wrapper.find('ExportPrivateKeyModal').state().privateKey,
        'Private Key'
      )

    })

  })

  it('hides modal when clicking cancel button', () => {
    const cancelButton = wrapper.find('.btn-default.export-private-key__button')
    cancelButton.simulate('click')

    assert(props.hideModal.calledOnce)
  })
})
