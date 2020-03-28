import React from 'react'
import assert from 'assert'
import sinon from 'sinon'
import { shallow } from 'enzyme'
import ConfirmApproveContent from '../index'

describe('ConfirmApproveContext', function () {

  let wrapper

  const props = {
    currentCurrency: 'foo',
    fiatTransactionTotal: '0.02',
    ethTransactionTotal: '0.000112',
    showCustomizeGasModal: sinon.spy(),
    showEditApprovalPermissionModal: sinon.spy(),
  }

  beforeEach(function () {
    wrapper = shallow(
      <ConfirmApproveContent {...props} />, {
        context: {
          t: (str) => str,
        },
      }
    )
  })

  afterEach(function () {
    props.showCustomizeGasModal.resetHistory()
    props.showEditApprovalPermissionModal.resetHistory()
  })

  after(function () {
    sinon.restore()
  })

  it('expands the full tx context when clicking view full tx element', function () {
    const test = wrapper.find('.confirm-approve-content__view-full-tx-button-wrapper')

    assert.equal(wrapper.state('showFullTxDetails'), false)
    test.simulate('click')
    assert.equal(wrapper.state('showFullTxDetails'), true)

    assert.equal(wrapper.find('.confirm-approve-content__full-tx-content').length, 1)
  })

  it('expands view and clicks edit on permission', function () {
    const test = wrapper.find('.confirm-approve-content__view-full-tx-button-wrapper')
    test.simulate('click')

    const edit = wrapper.find('.confirm-approve-content__small-blue-text').last()
    edit.simulate('click')

    assert(props.showEditApprovalPermissionModal.calledOnce)
  })

  it('shows customize gas modal when calling', function () {
    const edit = wrapper.find('.confirm-approve-content__small-blue-text').first()

    edit.simulate('click')

    assert(props.showCustomizeGasModal.calledOnce)
  })

  it('shows edit approve ', function () {
    const editApprovalPermission = wrapper.find('.confirm-approve-content__medium-link-text')

    editApprovalPermission.simulate('click')

    assert(props.showEditApprovalPermissionModal.calledOnce)
  })
})
