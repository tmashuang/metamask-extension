const assert = require('assert')
const { sufficientBalance, getEnvironmentType, getStack } = require('../../../app/scripts/lib/util')


describe('SufficientBalance', function () {
  it('returns true if max tx cost is equal to balance.', function () {
    const tx = {
      'value': '0x1',
      'gas': '0x2',
      'gasPrice': '0x3',
    }
    const balance = '0x8'

    const result = sufficientBalance(tx, balance)
    assert.ok(result, 'sufficient balance found.')
  })

  it('returns true if max tx cost is less than balance.', function () {
    const tx = {
      'value': '0x1',
      'gas': '0x2',
      'gasPrice': '0x3',
    }
    const balance = '0x9'

    const result = sufficientBalance(tx, balance)
    assert.ok(result, 'sufficient balance found.')
  })

  it('returns false if max tx cost is more than balance.', function () {
    const tx = {
      'value': '0x1',
      'gas': '0x2',
      'gasPrice': '0x3',
    }
    const balance = '0x6'

    const result = sufficientBalance(tx, balance)
    assert.ok(!result, 'insufficient balance found.')
  })

  it('returns popup environment with popup.html path', function () {
    const environment = getEnvironmentType('test.io/popup.html')
    assert.equal(environment, 'popup')
  })

  it('returns fullscreen environment with home.html path', function () {
    const environment = getEnvironmentType('test.io/home.html')
    assert.equal(environment, 'fullscreen')
  })

  it('returns error message stack', function () {
    const stack = getStack()
    assert(stack)
  })
})
