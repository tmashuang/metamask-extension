import assert from 'assert'
import {
  calcMaxAmount,
} from '../amount-max-button.utils.js'

describe('amount-max-button utils', () => {

  describe('calcMaxAmount()', () => {
    it(
      'should calculate the correct amount when no sendToken defined',
      () => {
        assert.deepEqual(calcMaxAmount({
          balance: 'ffffff',
          gasTotal: 'ff',
          sendToken: false,
        }), 'ffff00')
      }
    )

    it(
      'should calculate the correct amount when a sendToken is defined',
      () => {
        assert.deepEqual(calcMaxAmount({
          sendToken: {
            decimals: 10,
          },
          tokenBalance: '64',
        }), 'e8d4a51000')
      }
    )
  })

})
