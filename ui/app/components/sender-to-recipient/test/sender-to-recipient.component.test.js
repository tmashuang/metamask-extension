import React from 'react'
import assert from 'assert'
import sinon from 'sinon'
import { shallow } from 'enzyme'
import SenderToRecipient from '../sender-to-recipient.component'
import Tooltip from '../../tooltip-v2'

// used in copyToClipboard
const windowStub = sinon.stub(window, 'prompt').callsFake(() => {})

describe('Send To Recipient', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallow(<SenderToRecipient/>, { context: { t: str => str + '_t' } })
  })

  after(() => {
    windowStub.restore()
  })

  describe('Tooltip', () => {

    it('renders copy address tooltip', () => {
      assert.equal(wrapper.find(Tooltip).length, 1)
    })

    it('renders copy address title', () => {
      assert.equal(wrapper.find(Tooltip).prop('title'), 'copyAddress_t')
    })

  })

  describe('Sender Address', () => {

    it('shows checksum address when senderAddress and addressOnly is set', () => {
      wrapper.setProps({
        senderAddress: '0xsenderAddress',
        addressOnly: true,
      })

      assert.equal(wrapper.find('.sender-to-recipient__name').first().text(), 'from_t: 0xSeNdEradDReSS')
    })

    it('sets senderAddressCopied to true when clicked ', () => {
      assert.equal(wrapper.state('senderAddressCopied'), false)
      wrapper.find('.sender-to-recipient__party--sender').simulate('click')
      assert.equal(wrapper.state('senderAddressCopied'), true)
    })

  })

  describe('Recipient Address', () => {

    beforeEach(() => {
      wrapper.setProps({
        recipientAddress: '0xrecipientAddress',
        addressOnly: true,
      })
    })

    it('shows checksum address when recipientAddress and addressOnly is set', () => {
      assert.equal(wrapper.find('.sender-to-recipient__name').last().text(), 'to_t: 0xRECIpIENTADDRESs')
    })

    it('sets senderAddressCopied to true when clicked ', () => {
      assert.equal(wrapper.state('recipientAddressCopied'), false)
      wrapper.find('.sender-to-recipient__party--recipient-with-address').simulate('click')
      assert.equal(wrapper.state('recipientAddressCopied'), true)

    })

  })
})
