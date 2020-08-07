import React from 'react'
import sinon from 'sinon'
import assert from 'assert'
import { mountWithRouterHook } from '../../../../../../test/lib/render-helpers'

import { ADD_TOKEN_ROUTE } from '../../../../helpers/constants/routes'
import AddTokenButton from '../index'

describe('Add Token Button', function () {

  it('pushes add token route in history', function () {

    const historyMock = { push: sinon.spy(), location: {}, listen: sinon.stub() }

    const wrapper = mountWithRouterHook(
      <AddTokenButton />, historyMock
    )

    const addTokenButton = wrapper.find('button.button.btn-secondary')
    addTokenButton.simulate('click')

    assert(historyMock.push.calledOnce)
    assert.equal(historyMock.push.getCall(0).args[0], ADD_TOKEN_ROUTE)
  })


})
