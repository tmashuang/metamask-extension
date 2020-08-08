import assert from 'assert'

let mapStateToProps

jest.mock('react-redux', () => ({
  connect: (ms) => {
    mapStateToProps = ms
    return () => ({})
  }
}));

require('../transaction-activity-log.container.js')

describe('TransactionActivityLog container', () => {
  describe('mapStateToProps()', () => {
    it('should return the correct props', () => {
      const mockState = {
        metamask: {
          conversionRate: 280.45,
          nativeCurrency: 'ETH',
        },
      }

      assert.deepEqual(mapStateToProps(mockState), { conversionRate: 280.45, nativeCurrency: 'ETH' })
    })
  })
})
