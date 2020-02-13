import React from 'react'
import assert from 'assert'
import sinon from 'sinon'
import { mountWithRouter } from '../../../../../../../test/lib/render-helpers'
import LoadingNetworkError from '../index'

describe('LoadingNetworkError', () => {
  let wrapper

  const props = {
    hideModal: sinon.spy(),
  }

  beforeEach(() => {
    wrapper = mountWithRouter(
      <LoadingNetworkError.WrappedComponent {...props} />
    )
  })

  it('click try again button and calls hide modal', () => {
    const tryAgainButton = wrapper.find('.button.modal-container__footer-button')
    tryAgainButton.simulate('click')

    assert(props.hideModal.calledOnce)
  })
})
