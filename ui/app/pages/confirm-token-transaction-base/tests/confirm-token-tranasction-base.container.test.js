import proxyquire from 'proxyquire'
import assert from 'assert'

let mapStateToProps

proxyquire('../confirm-token-transaction-base.container.js', {
  'react-redux': {
    connect: (ms) => {
      mapStateToProps = ms
      return () => ({})
    },
  },
  'react-router-dom': { withRouter: () => {} },
  'redux': { compose: (_, arg2) => () => arg2() },
})

describe('Confirm Token Transaction Base', function () {

  const mockState = {
    metamask: {
      contractExchangeRates: {
        '0x617b3f8050a0bd94b6b1da02b4384ee5b4df13f4': 0,
      },
      tokens: [
        {
          address: '0x617b3f8050a0bd94b6b1da02b4384ee5b4df13f4',
          symbol: 'META',
          decimals: 18,
        },
      ],
      currentCurrency: 'usd',
      conversionRate: 1,
      currentNetworkTxList: [
        {
          id: 1,
          metamaskNetworkId: '66',
          status: 'unapproved',
          txParams: {
            from: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
            to: '0x617b3f8050a0bd94b6b1da02b4384ee5b4df13f4',
            value: '0x0',
            data: '0xa9059cbb0000000000000000000000000dcd5d886577d5081b0c52e242ef29e70be3e7bc0000000000000000000000000000000000000000000000000de0b6b3a7640000',
            gas: '0xd8b1',
            gasPrice: '0x2540be400',
          },
        },
      ]
    },
    confirmTransaction: {
      txData: {
        id: 1,
        metamaskNetworkId: '66',
        status: 'unapproved',
        txParams: {
          from: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
          to: '0x617b3f8050a0bd94b6b1da02b4384ee5b4df13f4',
          value: '0x0',
          data: '0xa9059cbb0000000000000000000000000dcd5d886577d5081b0c52e242ef29e70be3e7bc0000000000000000000000000000000000000000000000000de0b6b3a7640000',
          gas: '0xd8b1',
          gasPrice: '0x2540be400',
        },
      },
    },
  }

  const ownProps = {
    match: {},
  }

  it('mapStateToProps', function () {
    const props = mapStateToProps(mockState, ownProps)

    assert.deepEqual(
      props,
      {
        toAddress: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc', // decode from data
        tokenAddress: mockState.confirmTransaction.txData.txParams.to,
        tokenAmount: 1,
        tokenSymbol: mockState.metamask.tokens[0].symbol,
        currentCurrency: mockState.metamask.currentCurrency,
        conversionRate: mockState.metamask.conversionRate,
        contractExchangeRate: 0,
        fiatTransactionTotal: '0',
        ethTransactionTotal: '0.000555',
      }
    )
  })
})
