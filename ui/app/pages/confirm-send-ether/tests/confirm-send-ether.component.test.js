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


describe.only('Confirm Send ', function () {

  after(function () {
    sinon.restore()
  })

  describe('mapDispatchToProps()', function () {

    let mapDispatchToPropsObject

    const params = {
      
    }

    beforeEach(function () {
      mapDispatchToPropsObject = mapDispatchToProps()
    })

    it('a', function () {
      mapDispatchToPropsObject.editTransaction()
    })
  })
})