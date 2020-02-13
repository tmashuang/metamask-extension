import React from 'react'
import assert from 'assert'
import sinon from 'sinon'
import { shallow } from 'enzyme'
import NetworkForm from '../index'

describe('NetworkForm', () => {
  let wrapper

  let resetFormSpy

  const props = {
    rpcUrls: [],
    editRpc: sinon.spy(),
    showConfirmDeleteNetworkModal: sinon.spy(),
    onClear: sinon.spy(),
    setRpcTarget: sinon.spy(),
  }

  beforeEach(() => {
    wrapper = shallow(
      <NetworkForm {...props} />, {
        context: {
          t: str => str,
          metricsEvent: () => {},
        },
      }
    )

    resetFormSpy = sinon.spy(wrapper.instance(), 'resetForm')
  })

  afterEach(() => {
    props.onClear.resetHistory()
  })

  it('changes network name', () => {
    const networkNameInput = wrapper.find('#network-name')

    const accountName = 'Account Name'

    const event = { target: { value: accountName } }
    networkNameInput.simulate('change', event)
    // console.log(wrapper.state())
    assert.equal(wrapper.state('networkName'), accountName)
  })

  describe('Rpc Url', () => {

    it('changes rpc url', () => {
      const rpcUrlInput = wrapper.find('#rpc-url')

      const rpcUrl = 'https://validUrl.test'

      const event = { target: { value: rpcUrl } }
      rpcUrlInput.simulate('change', event)
      assert.equal(wrapper.state('rpcUrl'), rpcUrl)
    })

    it('errors on non valid rpc urls', () => {
      const rpcUrlInput = wrapper.find('#rpc-url')

      const rpcUrl = 'invalidUrl.test'

      const event = { target: { value: rpcUrl } }
      rpcUrlInput.simulate('change', event)

      assert.deepEqual(
        wrapper.state('errors'),
        { rpcUrl: 'urlErrorMsg' }
      )
    })

  })

  it('changes chainId', () => {
    const chainIdInput = wrapper.find('#chainId')

    const chainId = 99

    const event = { target: { value: chainId } }
    chainIdInput.simulate('change', event)
    assert.equal(wrapper.state('chainId'), chainId)
  })

  it('changes ticker/symbol', () => {
    const symbolInput = wrapper.find('#network-ticker')

    const ticker = 'TST'

    const event = { target: { value: ticker } }
    symbolInput.simulate('change', event)
    assert.equal(wrapper.state('ticker'), ticker)
  })

  describe('Block Explorer Url', () => {

    it('changes block explorer url', () => {
      const blockExplorerInput = wrapper.find('#block-explorer-url')

      const blockExplorerUrl = 'https://block.explorer'

      const event = { target: { value: blockExplorerUrl } }
      blockExplorerInput.simulate('change', event)
      assert.equal(wrapper.state('blockExplorerUrl'), blockExplorerUrl)
    })

    it('errors on a non valid url', () => {
      const blockExplorerInput = wrapper.find('#block-explorer-url')

      const blockExplorerUrl = 'block.explorer'

      const event = { target: { value: blockExplorerUrl } }
      blockExplorerInput.simulate('change', event)

      assert.deepEqual(
        wrapper.state('errors'),
        { blockExplorerUrl: 'urlErrorMsg' }
      )
    })
  })

  describe('Handles Cancel', () => {
    it('cancel button resets form', () => {
      const cancelButton = wrapper.find({ type: 'default' })

      cancelButton.simulate('click')

      assert(resetFormSpy.calledOnce)
    })

    it('cancels button calls onClear when in add mode', () => {
      wrapper.setProps({ networksTabIsInAddMode: true })
      const cancelButton = wrapper.find({ type: 'default' })

      cancelButton.simulate('click')
      assert(props.onClear.calledOnce)
    })
  })

  describe('Handles Submit', () => {
    it('is disabled by default', () => {
      const saveButton = wrapper.find({ type: 'secondary' })

      assert.equal(saveButton.prop('disabled'), true)
    })

    it('sets network name and rpc url to enable submit button then deletes the network', () => {
      // Change network name
      const networkNameInput = wrapper.find('#network-name')

      const networkName = 'Network Name'

      const accountNameEvent = { target: { value: networkName } }
      networkNameInput.simulate('change', accountNameEvent)

      // Change rpc url
      const rpcUrlInput = wrapper.find('#rpc-url')

      const rpcUrl = 'https://validUrl.test'

      const rpcUrlEvent = { target: { value: rpcUrl } }
      rpcUrlInput.simulate('change', rpcUrlEvent)

      const saveButton = wrapper.find({ type: 'secondary' })

      // Checks disabled submit button
      assert.equal(saveButton.prop('disabled'), false)

      saveButton.simulate('click')

      assert(props.setRpcTarget.calledOnce)
      assert.deepEqual(
        props.setRpcTarget.getCall(0).args,
        [rpcUrl, '', '', networkName, { blockExplorerUrl: undefined }]
      )

      const deleteButton = wrapper.find({ type: 'danger' })
      deleteButton.simulate('click')

      assert(props.showConfirmDeleteNetworkModal.calledOnce)
    })

  })
})
