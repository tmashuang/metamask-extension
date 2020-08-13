import React from 'react'
import assert from 'assert'
import sinon from 'sinon'
import { shallow } from 'enzyme'
import { ADD_TOKEN_ROUTE } from '../../../../helpers/constants/routes'
import AssertList from '../asset-list'

xdescribe('Asset List', function () {
  let wrapper, props

  beforeEach(function () {

    props = {
      history: {
        push: sinon.spy(),
      },
      setSelectedToken: sinon.spy(),
      unsetSelectedToken: sinon.spy(),
    }

    wrapper = shallow(
      <AssertList {...props} />, {
        context: {
          metricsEvent: () => {},
        },
      }
    )
  })

  it('calls unsetSelectedToken prop function when clicking wallet balance component wrapper', function () {
    const walletBalance = wrapper.find('.wallet-balance')

    walletBalance.simulate('click')
    assert(props.unsetSelectedToken.calledOnce)
  })


  it('calls router to push history with add token route', function () {
    const addTokenButton = wrapper.find('AddTokenButton')

    addTokenButton.simulate('click')
    assert(props.history.push.calledOnce)
    assert.equal(props.history.push.getCall(0).args[0], ADD_TOKEN_ROUTE)
  })

  it('calls setSelectedToken prop function', function () {
    const tokenList = wrapper.find('Connect(TokenList)')

    tokenList.prop('onTokenClick')()
    assert(props.setSelectedToken.calledOnce)
  })

})
