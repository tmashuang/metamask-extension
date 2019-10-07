import React from 'react'
import assert from 'assert'
import sinon from 'sinon'
import { mount } from 'enzyme'
import DepositEtherModal from '../deposit-ether-modal'

describe('Deposit Ether Modal', () => {
  let wrapper


  describe('Non Test Network', () => {

    const props = {
      toWyre: sinon.spy(),
      toCoinSwitch: sinon.spy(),
      hideModal: sinon.spy(),
      hideWarning: sinon.spy(),
      showAccountDetailModal: sinon.spy(),
      toFaucet: sinon.spy(),
    }

    beforeEach(() => {

      wrapper = mount(
        <DepositEtherModal.WrappedComponent {...props} />, {
          context: {
            t: str => str,
          },
          childContextTypes: {
            t: React.PropTypes.func,
          },
        }
      )

    })

    afterEach(() => {
      props.hideModal.resetHistory()
      props.hideWarning.resetHistory()
      props.showAccountDetailModal.resetHistory()
      props.toWyre.resetHistory()
    })

    it('renders', () => {
      assert.equal(wrapper.length, 1)
    })

    it('closes modal hides warnings and hides modal', () => {
      const closeButton = wrapper.find('div.page-container__header-close')

      closeButton.simulate('click')

      assert(props.hideWarning.calledOnce)
      assert(props.hideModal.calledOnce)
    })

    it('calls show account details modal when view account is clicked', () => {
      const viewAccount = wrapper.find('.button.btn-secondary.btn--large.deposit-ether-modal__deposit-button').at(0)

      viewAccount.simulate('click')

      assert(props.hideWarning.calledOnce)
      assert(props.hideModal.calledOnce)
      assert(props.showAccountDetailModal.calledOnce)
    })

    it('calls toWyre to dispatch buy eth with service wyre', () => {
      const wyreButton = wrapper.find('.button.btn-secondary.btn--large.deposit-ether-modal__deposit-button').at(1)

      wyreButton.simulate('click')

      assert(props.toWyre.calledOnce)
    })

    it('calls toCoinSwitch to dispatch buy eth with service coinswitch', () => {
      const coinSwitch = wrapper.find('.button.btn-secondary.btn--large.deposit-ether-modal__deposit-button').at(2)

      coinSwitch.simulate('click')

      assert(props.toCoinSwitch.calledOnce)
    })

  })

  describe('Test Faucet', () => {

    const props = {
      network: '3',
      toFaucet: sinon.spy(),
    }

    beforeEach(() => {
      wrapper = mount(
        <DepositEtherModal.WrappedComponent {...props} />, {
          context: {
            t: str => str,
          },
          childContextTypes: {
            t: React.PropTypes.func,
          },
        }
      )
    })

    it('initializes testFaucet when network in props is test network', () => {
      const testFaucet = wrapper.find('.deposit-ether-modal__buy-row__description__title').at(1)

      assert.equal(testFaucet.text(), 'testFaucet')
    })

    it('clicks get ether to faucet with the appropriate network', () => {
      const getEther = wrapper.find('.button.btn-secondary.btn--large.deposit-ether-modal__deposit-button').at(1)

      getEther.simulate('click')

      assert(props.toFaucet.calledOnce)
      assert.equal(props.toFaucet.getCall(0).args[0], props.network)
    })
  })

})
