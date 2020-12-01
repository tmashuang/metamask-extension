import assert from 'assert'
import sinon from 'sinon'

let mapDispatchToProps
let mergeProps

const actionSpies = {
  showModal: sinon.spy(),
  setGasPrice: sinon.spy(),
  setGasTotal: sinon.spy(),
  setGasLimit: sinon.spy(),
}

const sendDuckSpies = {
  showGasButtonGroup: sinon.spy(),
}

const gasDuckSpies = {
  resetCustomData: sinon.spy(),
  setCustomGasPrice: sinon.spy(),
  setCustomGasLimit: sinon.spy(),
}

jest.mock('react-redux', () => ({
  connect: (_, md, mp) => {
    mapDispatchToProps = md
    mergeProps = mp
    return () => ({})
  }
}));

jest.mock('../../../../selectors', () => ({
  getSendMaxModeState: (s) => `mockMaxModeOn:${s}`
}));

jest.mock('../../send.utils.js', () => ({
  isBalanceSufficient: ({
    amount,
    gasTotal,
    balance,
    conversionRate,
  }) => `${amount}:${gasTotal}:${balance}:${conversionRate}`,

  calcGasTotal: (gasLimit, gasPrice) => gasLimit + gasPrice
}));

jest.mock('../../../../store/actions', () => actionSpies);
jest.mock('../../../../ducks/send/send.duck', () => sendDuckSpies);
jest.mock('../../../../ducks/gas/gas.duck', () => gasDuckSpies);

require('../send-gas-row.container.js')

describe('send-gas-row container', () => {

  describe('mapDispatchToProps()', () => {
    let dispatchSpy
    let mapDispatchToPropsObject

    beforeEach(() => {
      dispatchSpy = sinon.spy()
      mapDispatchToPropsObject = mapDispatchToProps(dispatchSpy)
      actionSpies.setGasTotal.resetHistory()
    })

    describe('showCustomizeGasModal()', () => {
      it('should dispatch an action', () => {
        mapDispatchToPropsObject.showCustomizeGasModal()
        assert(dispatchSpy.calledOnce)
        assert.deepEqual(
          actionSpies.showModal.getCall(0).args[0],
          { name: 'CUSTOMIZE_GAS', hideBasic: true },
        )
      })
    })

    describe('setGasPrice()', () => {
      it('should dispatch an action', () => {
        mapDispatchToPropsObject.setGasPrice('mockNewPrice', 'mockLimit')
        assert(dispatchSpy.calledThrice)
        assert(actionSpies.setGasPrice.calledOnce)
        assert.equal(actionSpies.setGasPrice.getCall(0).args[0], 'mockNewPrice')
        assert.equal(gasDuckSpies.setCustomGasPrice.getCall(0).args[0], 'mockNewPrice')
        assert(actionSpies.setGasTotal.calledOnce)
        assert.equal(actionSpies.setGasTotal.getCall(0).args[0], 'mockLimitmockNewPrice')
      })
    })

    describe('setGasLimit()', () => {
      it('should dispatch an action', () => {
        mapDispatchToPropsObject.setGasLimit('mockNewLimit', 'mockPrice')
        assert(dispatchSpy.calledThrice)
        assert(actionSpies.setGasLimit.calledOnce)
        assert.equal(actionSpies.setGasLimit.getCall(0).args[0], 'mockNewLimit')
        assert.equal(gasDuckSpies.setCustomGasLimit.getCall(0).args[0], 'mockNewLimit')
        assert(actionSpies.setGasTotal.calledOnce)
        assert.equal(actionSpies.setGasTotal.getCall(0).args[0], 'mockNewLimitmockPrice')
      })
    })

    describe('showGasButtonGroup()', () => {
      it('should dispatch an action', () => {
        mapDispatchToPropsObject.showGasButtonGroup()
        assert(dispatchSpy.calledOnce)
        assert(sendDuckSpies.showGasButtonGroup.calledOnce)
      })
    })

    describe('resetCustomData()', () => {
      it('should dispatch an action', () => {
        mapDispatchToPropsObject.resetCustomData()
        assert(dispatchSpy.calledOnce)
        assert(gasDuckSpies.resetCustomData.calledOnce)
      })
    })
  })

  describe('mergeProps', () => {
    it('should return the expected props when isConfirm is true', () => {
      const stateProps = {
        gasPriceButtonGroupProps: {
          someGasPriceButtonGroupProp: 'foo',
          anotherGasPriceButtonGroupProp: 'bar',
        },
        someOtherStateProp: 'baz',
      }
      const dispatchProps = {
        setGasPrice: sinon.spy(),
        someOtherDispatchProp: sinon.spy(),
      }
      const ownProps = { someOwnProp: 123 }
      const result = mergeProps(stateProps, dispatchProps, ownProps)

      assert.equal(result.someOtherStateProp, 'baz')
      assert.equal(result.gasPriceButtonGroupProps.someGasPriceButtonGroupProp, 'foo')
      assert.equal(result.gasPriceButtonGroupProps.anotherGasPriceButtonGroupProp, 'bar')
      assert.equal(result.someOwnProp, 123)

      assert.equal(dispatchProps.setGasPrice.callCount, 0)
      result.gasPriceButtonGroupProps.handleGasPriceSelection()
      assert.equal(dispatchProps.setGasPrice.callCount, 1)

      assert.equal(dispatchProps.someOtherDispatchProp.callCount, 0)
      result.someOtherDispatchProp()
      assert.equal(dispatchProps.someOtherDispatchProp.callCount, 1)
    })
  })
})
