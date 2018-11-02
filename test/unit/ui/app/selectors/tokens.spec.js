import assert from 'assert'
import {
  selectedTokenAddressSelector,
  tokenSelector,
  selectedTokenSelector,
} from '../../../../../ui/app/selectors/tokens'

describe('Token Selector', () => {

  const testToken = {
    address: '0xToken',
    decimals: 0,
    symbol: 'TOKEN',
  }

  const state = {
    metamask: {
      selectedTokenAddress: '0xToken',
      tokens: [
        {
          'address': '0x617b3f8050a0bd94b6b1da02b4384ee5b4df13f4',
          'decimals': 18,
          'symbol': 'META',
        },
        testToken,
      ],
    },
  }

  it('#selectedTokenAddressSelector returns selected token address from state', () => {
    const selectedToken = selectedTokenAddressSelector(state)
    assert.equal(selectedToken, '0xToken')
  })

  it('#tokenSelector returns full list of tokens', () => {
    const tokens = tokenSelector(state)

    assert.equal(tokens.length, 2)
  })

  it('#selectedTokenSelector returns selected token details from tokens list', () => {
    const selectedToken = selectedTokenSelector(state)
    assert.deepEqual(selectedToken, testToken)
  })
})
