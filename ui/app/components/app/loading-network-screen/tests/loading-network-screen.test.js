import React from 'react'
import assert from 'assert'
import sinon from 'sinon'
import configureStore from 'redux-mock-store'
import { mount, shallow } from 'enzyme'
import LoadingNetworkScreen from '../index'

describe('Loading Network Screen', () => {
  let wrapper

  const state = {
    metamask: {
      provider: {
        rpcTarget: '',
        chainId: null,
        nickname: '',
        type: 'type',
        rpcPrefs: {},
      },
    },
    appState: {
      loadingMessage: 'Loading Message',
    },
  }

  const mockStore = configureStore()
  const store = mockStore(state)

  const props = {
    store,
    setProviderArgs: sinon.spy(),
    setProviderType: sinon.spy(),
    showNetworkDropdown: sinon.spy(),
    isLoadingNetwork: false,
    providerId: 'localhost',
  }

  beforeEach(() => {
    wrapper = mount(
      <LoadingNetworkScreen {...props} />, {
        context: {
          t: str => str,
        },
      }
    )
  })

  it('renders', () => {
    assert.equal(wrapper.length, 1)
  })

})
