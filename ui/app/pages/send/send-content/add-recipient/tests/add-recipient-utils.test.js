import assert from 'assert'
import sinon from 'sinon'

import {
  REQUIRED_ERROR,
  INVALID_RECIPIENT_ADDRESS_ERROR,
  KNOWN_RECIPIENT_ADDRESS_ERROR,
} from '../../../send.constants'

const stubs = {
  isValidAddress: sinon.stub().callsFake((to) => Boolean(to.match(/^[0xabcdef123456798]+$/))),
}

jest.mock('../../../../helpers/utils/util', () => ({
  isValidAddress: stubs.isValidAddress
}));

const toRowUtils = require('../add-recipient.js')
const {
  getToErrorObject,
  getToWarningObject,
} = toRowUtils

describe('add-recipient utils', () => {

  describe('getToErrorObject()', () => {
    it('should return a required error if "to" is falsy', () => {
      assert.deepEqual(getToErrorObject(null), {
        to: REQUIRED_ERROR,
      })
    })

    it('should return null if "to" is falsy and hexData is truthy', () => {
      assert.deepEqual(getToErrorObject(null, true), {
        to: null,
      })
    })

    it(
      'should return an invalid recipient error if "to" is truthy but invalid',
      () => {
        assert.deepEqual(getToErrorObject('mockInvalidTo'), {
          to: INVALID_RECIPIENT_ADDRESS_ERROR,
        })
      }
    )

    it('should return null if "to" is truthy and valid', () => {
      assert.deepEqual(getToErrorObject('0xabc123'), {
        to: null,
      })
    })
  })

  describe('getToWarningObject()', () => {
    it(
      'should return a known address recipient error if "to" is a token address',
      () => {
        assert.deepEqual(getToWarningObject('0xabc123', [{ 'address': '0xabc123' }], { 'address': '0xabc123' }), {
          to: KNOWN_RECIPIENT_ADDRESS_ERROR,
        })
      }
    )

    it(
      'should null if "to" is a token address but sendToken is falsy',
      () => {
        assert.deepEqual(getToWarningObject('0xabc123', [{ 'address': '0xabc123' }]), {
          to: null,
        })
      }
    )

    it(
      'should return a known address recipient error if "to" is part of contract metadata',
      () => {
        assert.deepEqual(getToWarningObject('0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359', [{ 'address': '0xabc123' }], { 'address': '0xabc123' }), {
          to: KNOWN_RECIPIENT_ADDRESS_ERROR,
        })
      }
    )
    it(
      'should null if "to" is part of contract metadata but sendToken is falsy',
      () => {
        assert.deepEqual(getToWarningObject('0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359', [{ 'address': '0xabc123' }], { 'address': '0xabc123' }), {
          to: KNOWN_RECIPIENT_ADDRESS_ERROR,
        })
      }
    )
  })

})
