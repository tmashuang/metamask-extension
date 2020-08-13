import proxyquire from 'proxyquire'
import assert from 'assert'
import sinon from 'sinon'

let mapStateToProps, mapDispatchToProps

const actionSpies = {
  updateSend: sinon.spy(),
}

const duckActionSpies = {
  clearConfirmTransaction: sinon.spy(),
}

proxyquire('../confirm-send-ether.container.js', {
  'react-redux': {
    connect: (ms, md) => {
      mapStateToProps = ms
      mapDispatchToProps = md
      return () => ({})
    },
  },
  'react-router-dom': { withRouter: () => {} },
  'redux': { compose: (_, arg2) => () => arg2() },
  '../../store/actions': actionSpies,
  '../../ducks/confirm-transaction/confirm-transaction.duck': duckActionSpies,
})


describe('Confirm Send ', function () {

  after(function () {
    sinon.restore()
  })

  describe('mapDispatchToProps()', function () {

    let dispatchSpy
    let mapDispatchToPropsObject

    const txData = {
      id: 1,
      metamaskNetworkId: '66',
      status: 'unapproved',
      txParams: {
        from: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
        to: '0xec1adf982415d2ef5ec55899b9bfb8bc0f29251b',
        value: '0xde0b6b3a7640000',
        gas: '0x5208',
        gasPrice: '0x53724e00',
      },
    }

    beforeEach(function () {
      dispatchSpy = sinon.spy()
      mapDispatchToPropsObject = mapDispatchToProps(dispatchSpy)
    })

    afterEach(function () {
      actionSpies.updateSend.resetHistory()
      duckActionSpies.clearConfirmTransaction.resetHistory()
    })

    it('dispatches updateSend with params from txData when editingTransaction is dispatched', function () {
      mapDispatchToPropsObject.editTransaction(txData)

      assert(actionSpies.updateSend.calledOnce)
      assert.deepEqual(
        actionSpies.updateSend.getCall(0).args[0],
        {
          from: txData.txParams.from,
          gasLimit: txData.txParams.gas,
          gasPrice: txData.txParams.gasPrice,
          gasTotal: null,
          to: txData.txParams.to,
          amount: txData.txParams.value,
          errors: { to: null, amount: null },
          editingTransactionId: txData.id,
        }
      )
    })

    it('dispatches clearConfirmTransaction when editiingTransaction is dispatched', function () {
      mapDispatchToPropsObject.editTransaction(txData)

      assert(duckActionSpies.clearConfirmTransaction.calledOnce)
    })
  })

  describe('mapStateToProps()', function () {

    const mockState = {
      confirmTransaction: {
        txData: {
          id: 1,
          metamaskNetworkId: '66',
          status: 'unapproved',
          txParams: {
            from: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
            to: '0xec1adf982415d2ef5ec55899b9bfb8bc0f29251b',
            value: '0xde0b6b3a7640000',
            gas: '0x5208',
            gasPrice: '0x53724e00',
          },
        },
      },
    }

    it('should return txParams from confirmTransaction state ', function () {
      assert.deepEqual(mapStateToProps(mockState),
        { txParams: mockState.confirmTransaction.txData.txParams }
      )
    })
  })
})
