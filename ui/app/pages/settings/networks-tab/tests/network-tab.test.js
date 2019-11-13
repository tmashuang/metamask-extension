import React from 'react'
import assert from 'assert'
import sinon from 'sinon'
import { mountWithRouter } from '../../../../../../test/lib/render-helpers'
import NetworksTab from '../index'

describe('Networks Tab', () => {
  let wrapper

  const props = {
    editRpc: sinon.spy(),
    history: {
      push: sinon.spy(),
    },
    location: {
      pathname: '/',
    },
    networkIsSelected: true,
    networksTabIsInAddMode: false,
    networksToRender: [],
    selectedNetwork: {},
    setNetworksTabAddMode: sinon.spy(),
    setRpcTarget: sinon.spy(),
    setSelectedSettingsRpcUrl: sinon.spy(),
    showConfirmDeleteNetworkModal: sinon.spy(),
    providerUrl: '',
    providerType: '',
    networkDefaultedToProvider: true,
  }

  beforeEach(() => {
    wrapper = mountWithRouter(
      <NetworksTab.WrappedComponent {...props} />
    )
  })

  it('render', () => {
    assert.equal(wrapper.length, 1)
  })

  xit('render 2', () => {
    console.log(wrapper.debug())
  })

  it('add rpc url', () => {
    const event = { target: { value: 'HTTP://127.0.0.1:7545' } }
    const rpcUrlInput = wrapper.find('input#rpc-url')

    rpcUrlInput.simulate('change', event)
    console.log(rpcUrlInput.debug())
  })
})
