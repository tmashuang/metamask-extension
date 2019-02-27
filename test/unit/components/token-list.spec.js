import React from 'react'
// import assert from 'assert'
// import sinon from 'sinon'
// import nock from 'nock'
import { createMockStore } from 'redux-test-utils'
import { mount } from 'enzyme'

import TokenList from '../../../ui/app/components/token-list'

xdescribe('', function () {
  let wrapper

  const mockState = {
    metamask: {
      network: 1,
      tokens: {
        address: '0x617b3f8050a0bd94b6b1da02b4384ee5b4df13f4',
        symbol: 'META',
        decimals: 18,
      },
      assertImage: {},
      selectedAddress: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
    },
  }

  const store = createMockStore(mockState)

  beforeEach(function () {
    wrapper = mount(<TokenList store={store} />, { context: {t: str => str + '_t' }, childContextTypes: {t: () => {} }})
  })

  it('', () => {
    wrapper.setState({isLoading: false})
    wrapper.update()
    console.log(wrapper.debug())
  })

})
