import React from 'react'
import assert from 'assert'
import sinon from 'sinon'
import { shallow } from 'enzyme'
import ConfirmAddToken from '../confirm-add-token.component'

describe('ConfirmAddToken Component', function () {
  let wrapper

  const metaToken = {
    address: '0x617b3f8050a0bd94b6b1da02b4384ee5b4df13f4',
    symbol: 'META',
    decimals: 18,
  }

  const props = {
    history: {
      push: sinon.spy(),
    },
    clearPendingTokens: sinon.stub().resolves(),
    addTokens: sinon.stub().resolves(),
    pendingTokens: {},
  }

  beforeEach(function () {
    wrapper = shallow(
      <ConfirmAddToken {...props} />, {
        context: {
          t: (str) => str,
        },
      }
    )
  })

  afterEach(function () {
    props.history.push.resetHistory()
    props.clearPendingTokens.resetHistory()
    props.addTokens.resetHistory()
  })

  it('pushes default route if pendingTokens is empty', function () {
    assert.equal(props.history.push.getCall(0).args[0], '/')
  })

  it('routes to add token route when clicking back', function () {

    const pendingTokens = {
      '0x617b3f8050a0bd94b6b1da02b4384ee5b4df13f4': metaToken,
    }

    wrapper.setProps({ pendingTokens })

    const back = wrapper.find({ type: 'default' })
    back.simulate('click')

    assert.equal(props.history.push.getCall(1).args[0], '/add-token')
  })

  it('clicks add token calls addToken with token info', function () {

    const pendingTokens = {
      '0x617b3f8050a0bd94b6b1da02b4384ee5b4df13f4': metaToken,
    }

    wrapper.setProps({ pendingTokens })


    const addTokens = wrapper.find({ type: 'secondary' })
    addTokens.simulate('click')

    setImmediate(() => {
      assert(props.addTokens.calledOnce)
      assert.deepEqual(
        props.addTokens.getCall(0).args[0],
        pendingTokens
      )
      assert(props.clearPendingTokens.calledOnce)
      assert.equal(props.history.push.getCall(0).args[0], '/')
    })
  })
})
