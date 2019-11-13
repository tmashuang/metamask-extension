import React from 'react'
import assert from 'assert'
import sinon from 'sinon'
import configureMockStore from 'redux-mock-store'
import { mountWithRouter } from '../../../../../../test/lib/render-helpers'
import SignatureRequest from '../index'

describe('Signature Request', () => {

  describe('Basic render and click simulation', () => {
    let wrapper

    const mockState = {
      metamask: {
        provider: {
          type: 'test',
        },
      },
    }

    const store = configureMockStore()(mockState)

    const props = {
      history: {
        push: sinon.spy(),
      },
      clearConfirmTransaction: sinon.spy(),
      cancelMessage: sinon.spy(),
      cancel: sinon.stub().resolves(),
      sign: sinon.stub().resolves(),
      txData: {
        msgParams: {
          data: '{"message": {"from": {"name": "hello"}}}',
          from: '0xAddress',
          origin: 'test.domain',
        },
      },
      selectedAccount: {
        '0xAddress': {
          address: '0xAddress',
          balance: '0x0',
        },
      },
    }

    beforeEach(() => {
      wrapper = mountWithRouter(
        <SignatureRequest.WrappedComponent {...props} />, store
      )
    })

    afterEach(() => {
      props.clearConfirmTransaction.resetHistory()
    })

    it('renders', () => {
      assert.equal(wrapper.length, 1)
    })

    it('cancel', () => {
      const cancelButton = wrapper.find('.button.btn-default.btn--large')
      cancelButton.simulate('click')

      assert(props.cancel.calledOnce)
    })

    it('sign', () => {
      const signButton = wrapper.find('.button.btn-primary.btn--large')
      signButton.simulate('click')

      assert(props.sign.calledOnce)
    })
  })

  describe('Typed Data Message with no message.from field', () => {
    let wrapper

    const mockStore = {
      metamask: {
        provider: {
          type: 'test',
        },
      },
    }

    const store = configureMockStore()(mockStore)

    const props = {
      history: {
        push: sinon.spy(),
      },
      clearConfirmTransaction: sinon.spy(),
      cancelMessage: sinon.spy(),
      cancel: sinon.stub().resolves(),
      sign: sinon.stub().resolves(),
      txData: {
        msgParams: {
          data: '{"message": {"amount": "100", "something": {"else": "hello"}}}',
          from: '0xAddress',
          origin: 'test.domain',
        },
      },
      selectedAccount: {
        '0xAddress': {
          address: '0xAddress',
          balance: '0x0',
        },
      },
    }


    beforeEach(() => {
      wrapper = mountWithRouter(
        <SignatureRequest.WrappedComponent {...props} />, store
      )
    })

    it('renders when message without from field', () => {
      assert.equal(wrapper.length, 1)
    })
  })

})
