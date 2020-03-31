import proxyquire from 'proxyquire'
import sinon from 'sinon'
import assert from 'assert'

let mapStateToProps, mapDispatchToProps

const actionSpies = {
  setSelectedToken: sinon.spy(),
  updateSend: sinon.spy(),
  showSendTokenPage: sinon.spy(),
}

const duckActionSpies = {
  clearConfirmTransaction: sinon.spy(),
}

proxyquire('../confirm-send-token.container.js', {
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

describe('Confirm Send', function () {

  after(function () {
    sinon.restore()
  })

  describe('mapDispatchToProps()', function () {

    let mapDispatchToPropsObject

    const params = {
      txData: {
        id: 1,
        metamaskNetworkId: '66',
        status: 'unapproved',
        txParams: {
          from: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
          to: '0x617b3f8050a0bd94b6b1da02b4384ee5b4df13f4',
          value: '0x0',
          data: '0xa9059cbb000000000000000000000000eddbb091d94d4a11084a4306bb945f509fd51db40000000000000000000000000000000000000000000000000de0b6b3a7640000',
          gas: '0xd8b1',
          gasPrice: '0x2540be400',
        },
      },
      tokenData: {
        name: 'transfer',
        params: [
          {
            name: '_to',
            value: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
            type: 'address',
          },
          {
            name: '_value',
            value: '1000000000000000000',
            type: 'uint256',
          },
        ],
      },
    }

    beforeEach(function () {
      mapDispatchToPropsObject = mapDispatchToProps()
    })

    afterEach(function () {
      actionSpies.setSelectedToken.resetHistory()
      actionSpies.updateSend.resetHistory()
      actionSpies.showSendTokenPage.resetHistory()
      duckActionSpies.clearConfirmTransaction.resetHistory()
    })


    it('dispatches setSelectedToken when editTransaction is dispatched', function () {

      mapDispatchToPropsObject.editTransaction(params)

      assert(actionSpies.setSelectedToken.calledOnce)
      assert.equal(actionSpies.setSelectedToken.getCall(0).args[0], '0x617b3f8050a0bd94b6b1da02b4384ee5b4df13f4')

    })

    it('dispatches updateSend when editTransaction is dispatched', function () {
      mapDispatchToPropsObject.editTransaction(params)

      assert(actionSpies.updateSend.calledOnce)
      assert.deepEqual(
        actionSpies.updateSend.getCall(0).args[0],
        {
          from: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
          gasLimit: '0xd8b1',
          gasPrice: '0x2540be400',
          gasTotal: null,
          to: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
          amount: 'de0b6b3a7640000',
          errors: { to: null, amount: null },
          editingTransactionId: '1',
          token: { address: '0x617b3f8050a0bd94b6b1da02b4384ee5b4df13f4' },
        }
      )
    })

    it('dispatches clearConfirmTransaction and showSendTokenPage when editTransaction is dispatched', function () {
      mapDispatchToPropsObject.editTransaction(params)

      assert(duckActionSpies.clearConfirmTransaction.calledOnce)
      assert(actionSpies.showSendTokenPage.calledOnce)
    })

  })

  describe('mapStateToProps()', function () {
    it('should return token amount from confirmTransaction state', function () {
      const mockState = {
        confirmTransaction: {
          tokenData: {
            name: 'transfer',
            params: [
              {
                name: '_to',
                value: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
                type: 'address',
              },
              {
                name: '_value',
                value: '1000000000000000000',
                type: 'uint256',
              },
            ],
          },
        },
      }

      assert.deepEqual(mapStateToProps(mockState), { tokenAmount: 1000000000000000000 })
    })
  })
})
