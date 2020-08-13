import React from 'react'
import assert from 'assert'
import sinon from 'sinon'
import { shallow } from 'enzyme'
import ConfirmAddSuggestedToken from '../confirm-add-suggested-token.component'

describe('ConfirmAddSuggestedToken', function () {

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
    removeSuggestedTokens: sinon.stub().resolves(),
    addToken: sinon.stub().resolves(),
    pendingTokens: {},
    tokens: [],
  }

  beforeEach(function () {
    wrapper = shallow(
      <ConfirmAddSuggestedToken {...props} />, {
        context: {
          t: (str) => str,
        },
      }
    )
  })

  afterEach(function () {
    props.history.push.resetHistory()
    props.removeSuggestedTokens.resetHistory()
    props.addToken.resetHistory()
  })

  after(function () {
    sinon.restore()
  })

  it('pushes default route if pendingTokens is empty', function () {
    assert.equal(props.history.push.getCall(0).args[0], '/')
  })

  it('clicks cancel calls removeSuggestTokens', function () {

    const pendingTokens = {
      '0x617b3f8050a0bd94b6b1da02b4384ee5b4df13f4': metaToken,
    }

    wrapper.setProps({ pendingTokens })

    const cancel = wrapper.find({ type: 'default' })
    cancel.simulate('click')

    setImmediate(() => {
      assert(props.removeSuggestedTokens.calledOnce)
      assert.equal(props.history.push.getCall(1).args[0], '/')
    })
  })

  it('clicks add token calls addToken with token info', function () {

    const pendingTokens = {
      '0x617b3f8050a0bd94b6b1da02b4384ee5b4df13f4': metaToken,
    }

    wrapper.setProps({ pendingTokens })

    const addToken = wrapper.find({ type: 'secondary' })
    addToken.simulate('click')

    setImmediate(() => {
      assert(props.addToken.calledOnce)
      assert.deepEqual(
        props.addToken.getCall(0).args[0],
        metaToken
      )
      assert.equal(props.history.push.getCall(0).args[0], '/')
    })
  })

  it('renders knownTokenWarning when pendingToken prop is found in tokens prop', function () {
    const tokens = [
      metaToken,
    ]

    const pendingTokens = {
      '0x617b3f8050a0bd94b6b1da02b4384ee5b4df13f4': metaToken,
    }

    wrapper.setProps({ tokens, pendingTokens })

    const warning = wrapper.find('.warning')
    assert.equal(warning.text(), 'knownTokenWarning')
  })

  it('renders reusedTokenNameWarning when ', function () {
    const tokens = [
      metaToken,
    ]

    const pendingTokens = {
      '0xWrongAddress': {
        address: '0xWrongAddress',
        symbol: 'META',
        decimals: 18,
      },
    }

    wrapper.setProps({ tokens, pendingTokens })

    const warning = wrapper.find('.warning')
    assert.equal(warning.text(), 'reusedTokenNameWarning')
  })
})
