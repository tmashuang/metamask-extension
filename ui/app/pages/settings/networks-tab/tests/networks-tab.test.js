import React from 'react'
import { Provider } from 'react-redux'
import assert from 'assert'
import sinon from 'sinon'
import configureMockStore from 'redux-mock-store'
import { mountWithRouter } from '../../../../../../test/lib/render-helpers'
import NetworksTab from '../index'

describe.only('Networks Tab', () => {

  let wrapper

  const mockStore = {
    metamask: {
      frequentRpcListDetail: [],
      provider: {
        rpcTarget: '',
      },
    },
    appState: {
      networksTabSelectedRpcUrl: null,
    },
  }

  const store = configureMockStore()(mockStore)

  const props = {
    editRpc: sinon.spy(),
    history: {
      push: sinon.spy(),
    },
    setSelectedSettingsRpcUrl: sinon.spy(),
    setNetworksTabAddMode: sinon.spy(),
  }

  beforeEach(() => {
    wrapper = mountWithRouter(
      <Provider store={store}>
        <NetworksTab />
      </Provider>
    )
  })

  it('', () => {
    console.log(wrapper.debug())
  })

  // it('renders', () => {
  //   assert.equal(wrapper.length, 1)
  // })
})
