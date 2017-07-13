const expect = require('chai').expect
const shallow = require('enzyme').shallow
const mount = require('enzyme').mount
const createStore = require('redux').createStore
const assert = require('assert')

const rootReducer = require('../../ui/app/reducers')
const App = require('../../ui/app/app')
const Component = require('react').Component

describe('i hate utils.inherits', () => {
  it('should just die', () => {
    console.log(App())
    assert(App instanceof Component)
    // console.log(Component)
  })
})


describe('First Time Onboarding', () => {
  describe('#terms and conditions', () => {
    it('should be true', () => {
      assert.equal(true, true)
    })
    it('should be false', () => {
      assert.notEqual(true, false)
    })
  })
})
