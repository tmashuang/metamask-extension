import assert from 'assert'
import * as tokenUtil from './token-util'

describe('Token Util ', function () {
  it.only('#calcTokenAmount', function () {
    const intTokenAmount = "100000000000000000000"
    const tokenDecimal = 18
    const tokenAmount = tokenUtil.calcTokenAmount(intTokenAmount, tokenDecimal)

    console.log(okenAmount)
  })
})