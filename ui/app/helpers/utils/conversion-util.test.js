import assert from 'assert'
import { addCurrencies, conversionUtil } from './conversion-util'
import BigNumber from 'bignumber.js'

describe('conversion utils', () => {
  describe('addCurrencies()', () => {
    it('add whole numbers', () => {
      const result = addCurrencies(3, 9)
      assert.equal(result.toNumber(), 12)
    })

    it('add decimals', () => {
      const result = addCurrencies(1.3, 1.9)
      assert.equal(result.toNumber(), 3.2)
    })

    it('add repeating decimals', () => {
      const result = addCurrencies(1 / 3, 1 / 9)
      assert.equal(result.toNumber(), 0.4444444444444444)
    })
  })

  describe('conversionUtil', () => {
    it('Returns expected types', () => {
      const conv1 = conversionUtil(1000000000000000000, { fromNumericBase: 'dec', toNumericBase: 'hex' })
      const conv2 = conversionUtil(1, { fromNumericBase: 'dec', fromDenomination: 'ETH', toDenomination: 'WEI' })
      assert(typeof conv1 === 'string', 'conversion 1 should return type string')
      assert(conv2 instanceof BigNumber, 'conversion 2 should be a BigNumber')
    })
    it('Converts from dec to hex', () => {
      assert.equal(conversionUtil('1000000000000000000', { fromNumericBase: 'dec', toNumericBase: 'hex' }), 'de0b6b3a7640000')
      assert.equal(conversionUtil('1500000000000000000', { fromNumericBase: 'dec', toNumericBase: 'hex' }), '14d1120d7b160000')
    })
    it('Converts hex formatted numbers to dec', () => {
      assert.equal(conversionUtil('0xde0b6b3a7640000', { fromNumericBase: 'hex', toNumericBase: 'dec' }), 1000000000000000000)
      assert.equal(conversionUtil('0x14d1120d7b160000', { fromNumericBase: 'hex', toNumericBase: 'dec' }), 1500000000000000000)
    })
    it('Converts WEI to ETH', () => {
      assert.equal(conversionUtil('0xde0b6b3a7640000', { fromNumericBase: 'hex', toNumericBase: 'dec', fromDenomination: 'WEI', toDenomination: 'ETH' }), 1)
      assert.equal(conversionUtil('0x14d1120d7b160000', { fromNumericBase: 'hex', toNumericBase: 'dec', fromDenomination: 'WEI', toDenomination: 'ETH' }), 1.5)
    })
    it('Converts ETH to WEI', () => {
      assert.equal(conversionUtil('1', { fromNumericBase: 'dec', fromDenomination: 'ETH', toDenomination: 'WEI' }), 1000000000000000000)
      assert.equal(conversionUtil('1.5', { fromNumericBase: 'dec', fromDenomination: 'ETH', toDenomination: 'WEI' }), 1500000000000000000)
    })
    it('Converts ETH to GWEI', () => {
      assert.equal(conversionUtil('1', { fromNumericBase: 'dec', fromDenomination: 'ETH', toDenomination: 'GWEI' }), 1000000000)
      assert.equal(conversionUtil('1.5', { fromNumericBase: 'dec', fromDenomination: 'ETH', toDenomination: 'GWEI' }), 1500000000)
    })
    it('Converts ETH to USD', () => {
      assert.equal(conversionUtil('1', { fromNumericBase: 'dec', toNumericBase: 'dec', toCurrency: 'usd', conversionRate: 468.58, numberOfDecimals: 2 }), 468.58)
      assert.equal(conversionUtil('1.5', { fromNumericBase: 'dec', toNumericBase: 'dec', toCurrency: 'usd', conversionRate: 468.58, numberOfDecimals: 2 }), 702.87)
    })
    it('Converts USD to ETH', () => {
      assert.equal(conversionUtil('468.58', { fromNumericBase: 'dec', toNumericBase: 'dec', toCurrency: 'usd', conversionRate: 468.58, numberOfDecimals: 2, invertConversionRate: true }), 1)
      assert.equal(conversionUtil('702.87', { fromNumericBase: 'dec', toNumericBase: 'dec', toCurrency: 'usd', conversionRate: 468.58, numberOfDecimals: 2, invertConversionRate: true }), 1.5)
    })
  })
})
