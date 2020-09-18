import assert from 'assert'

let mapStateToProps

jest.mock('react-redux', () => ({
  connect: (ms) => {
    mapStateToProps = ms
    return () => ({})
  }
}));

jest.mock('../../../selectors', () => ({
  getConversionRate: () => `mockConversionRate`,
  getCurrentCurrency: () => `mockCurrentCurrency`,
  getNativeCurrency: () => `mockNativeCurrency`,
  isBalanceCached: () => `mockBalanceIsCached`,

  getPreferences: ({ showFiatInTestnets }) => ({
    showFiatInTestnets,
  }),

  getIsMainnet: ({ isMainnet }) => isMainnet
}));

require('../account-list-item.container.js')

describe('account-list-item container', () => {

  describe('mapStateToProps()', () => {

    it('should map the correct properties to props', () => {
      assert.deepEqual(mapStateToProps({ isMainnet: true, showFiatInTestnets: false }), {
        nativeCurrency: 'mockNativeCurrency',
        balanceIsCached: 'mockBalanceIsCached',
        showFiat: true,
      })
    })

    it(
      'should map the correct properties to props when in mainnet and showFiatInTestnet is true',
      () => {
        assert.deepEqual(mapStateToProps({ isMainnet: true, showFiatInTestnets: true }), {
          nativeCurrency: 'mockNativeCurrency',
          balanceIsCached: 'mockBalanceIsCached',
          showFiat: true,
        })
      }
    )

    it(
      'should map the correct properties to props when not in mainnet and showFiatInTestnet is true',
      () => {
        assert.deepEqual(mapStateToProps({ isMainnet: false, showFiatInTestnets: true }), {
          nativeCurrency: 'mockNativeCurrency',
          balanceIsCached: 'mockBalanceIsCached',
          showFiat: true,
        })
      }
    )

    it(
      'should map the correct properties to props when not in mainnet and showFiatInTestnet is false',
      () => {
        assert.deepEqual(mapStateToProps({ isMainnet: false, showFiatInTestnets: false }), {
          nativeCurrency: 'mockNativeCurrency',
          balanceIsCached: 'mockBalanceIsCached',
          showFiat: false,
        })
      }
    )

  })

})
