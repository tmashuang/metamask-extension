const Web3 = require('web3')
const TestRPC = require('ethereumjs-testrpc')
const assert = require('assert')

describe('Accounts', () => {
  it('should respect BIP99 mnemonic', () => {
    const web3 = new Web3()
    web3.setProvider(TestRPC.provider())
    assert()
  })
})
