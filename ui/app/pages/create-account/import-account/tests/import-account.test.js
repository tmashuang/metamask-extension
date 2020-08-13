import React from 'react'
import { Provider } from 'react-redux'
import assert from 'assert'
import sinon from 'sinon'
import configureStore from 'redux-mock-store'
import { mountWithRouter } from '../../../../../../test/lib/render-helpers'
import NewAccountImportForm from '../index'

describe('NewAccountImportForm', function () {

  let wrapper

  const openTabSpy = sinon.spy()

  const mockStore = {
    metamask: {
      network: 'test',
      accounts: {
        '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc': {
          address: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
          balance: '0x0',
        },
      },
      cachedBalances: {
        test: {
          '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc': {
            address: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
            balance: '0x0',
          },
        },
      },
    },
    appState: {
      warning: '',
    },
  }

  const store = configureStore()(mockStore)

  beforeEach(function () {

    global.platform = {
      openTab: openTabSpy,
    }

    wrapper = mountWithRouter(
      <Provider store={store}>
        <NewAccountImportForm />
      </Provider>
    )
  })

  after(function () {
    sinon.restore()
  })

  it('opens support link about imported accounts', function () {
    const importMsgLink = wrapper.find('.new-account-import-disclaimer span').last()

    importMsgLink.simulate('click')

    assert(openTabSpy.calledOnce)
    assert.deepEqual(openTabSpy.getCall(0).args[0],
      { url: 'https://metamask.zendesk.com/hc/en-us/articles/360015289932' }
    )

  })

  it('shows json import subview when selecting json file in select menu', function () {
    const select = wrapper.find('Select')

    assert.equal(wrapper.find('PrivateKeyImportView').length, 1)

    select.prop('onChange')({ value: 'jsonFile' })
    wrapper.update()

    assert.equal(wrapper.find('JsonImportSubview').length, 1)
  })

})
