const Web3 = require('web3')
const TestRPC = require('ethereumjs-testrpc')
const assert = require('assert')

describe('RPC', () => {
  it('should return true', () => {
    assert.equal(true, true)
  })

  it('should connect to testrpc', () => {
    const web3 = new Web3()
    web3.setProvider(TestRPC.provider())
  })
})
