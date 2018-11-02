import assert from 'assert'
import * as util from '../conversions.util'
import { BigNumber as BN} from 'bignumber.js'

describe('Conversions Util', () => {
  it('#bnToHex', () => {
    const bigNumber = new BN(123445112332)
    const hex = util.bnToHex(bigNumber)
    assert.equal(hex, '0x1cbde6ee0c')
  })

  it('#hexToDecimal', () => {
    const bigNumber = new BN(123.456)
    const hex = util.bnToHex(bigNumber)
    const decimal = util.hexToDecimal(hex)
    assert.equal(decimal, '123.456')
  })

  it('#getEthConversionFromWeiHex', () => {
    // 1000000000000000000
    const weiHex = '0xde0b6b3a7640000'
    const eth = util.getEthConversionFromWeiHex({value: weiHex})
    assert.equal(eth, '1 ETH')
  })
})
