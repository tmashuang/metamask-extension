import assert from 'assert'
import sinon from 'sinon'

let mapStateToProps
let mapDispatchToProps

const actionSpies = {
  setMaxModeTo: sinon.spy(),
  updateSendAmount: sinon.spy(),
}
const duckActionSpies = {
  updateSendErrors: sinon.spy(),
}

jest.mock('react-redux', () => ({
  connect: (ms, md) => {
    mapStateToProps = ms
    mapDispatchToProps = md
    return () => ({})
  }
}));

jest.mock('../../../../../selectors', () => ({
  getGasTotal: (s) => `mockGasTotal:${s}`,
  getSendToken: (s) => `mockSendToken:${s}`,
  getSendFromBalance: (s) => `mockBalance:${s}`,
  getTokenBalance: (s) => `mockTokenBalance:${s}`,
  getSendMaxModeState: (s) => `mockMaxModeOn:${s}`,
  getBasicGasEstimateLoadingStatus: (s) => `mockButtonDataLoading:${s}`
}));

jest.mock('./amount-max-button.utils.js', () => ({
  calcMaxAmount: (mockObj) => mockObj.val + 1
}));

jest.mock('../../../../../store/actions', () => actionSpies);
jest.mock('../../../../../ducks/send/send.duck', () => duckActionSpies);

require('../amount-max-button.container.js')

describe('amount-max-button container', () => {

  describe('mapStateToProps()', () => {

    it('should map the correct properties to props', () => {
      assert.deepEqual(mapStateToProps('mockState'), {
        balance: 'mockBalance:mockState',
        buttonDataLoading: 'mockButtonDataLoading:mockState',
        gasTotal: 'mockGasTotal:mockState',
        maxModeOn: 'mockMaxModeOn:mockState',
        sendToken: 'mockSendToken:mockState',
        tokenBalance: 'mockTokenBalance:mockState',
      })
    })

  })

  describe('mapDispatchToProps()', () => {
    let dispatchSpy
    let mapDispatchToPropsObject

    beforeEach(() => {
      dispatchSpy = sinon.spy()
      mapDispatchToPropsObject = mapDispatchToProps(dispatchSpy)
    })

    describe('setAmountToMax()', () => {
      it('should dispatch an action', () => {
        mapDispatchToPropsObject.setAmountToMax({ val: 11, foo: 'bar' })
        assert(dispatchSpy.calledTwice)
        assert(duckActionSpies.updateSendErrors.calledOnce)
        assert.deepEqual(
          duckActionSpies.updateSendErrors.getCall(0).args[0],
          { amount: null },
        )
        assert(actionSpies.updateSendAmount.calledOnce)
        assert.equal(
          actionSpies.updateSendAmount.getCall(0).args[0],
          12,
        )
      })
    })

    describe('setMaxModeTo()', () => {
      it('should dispatch an action', () => {
        mapDispatchToPropsObject.setMaxModeTo('mockVal')
        assert(dispatchSpy.calledOnce)
        assert.equal(
          actionSpies.setMaxModeTo.getCall(0).args[0],
          'mockVal',
        )
      })
    })

  })

})
