import React from 'react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { waitFor } from '@testing-library/react';
import mockState from '../../../test/data/mock-state.json';
import { renderWithProvider } from '../../../test/lib/render-helpers';
import ConfirmSendToken from '.';

jest.mock('../../store/actions.js', () => ({
  getNextNonce: () => jest.fn(),
  disconnectGasFeeEstimatePoller: jest.fn(),
  addPollingTokenToAppState: jest.fn(),
  getGasFeeTimeEstimate: jest.fn().mockResolvedValue(''),
  getGasFeeEstimatesAndStartPolling: jest.fn().mockResolvedValue(''),
}));

describe('Confirm Send Token', () => {
  it('should render asset title ', () => {
    const sendTokenState = {
      ...mockState,
      confirmTransaction: {
        txData: {
          id: 4200915741652418,
          time: 1659543997515,
          status: 'unapproved',
          metamaskNetworkId: '1',
          originalGasEstimate: '0xd96b',
          userEditedGasLimit: false,
          chainId: '0x1',
          loadingDefaults: false,
          dappSuggestedGasFees: null,
          txParams: {
            from: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
            to: '0x617b3f8050a0bd94b6b1da02b4384ee5b4df13f4',
            value: '0x0',
            data:
              '0xa9059cbb0000000000000000000000000dcd5d886577d5081b0c52e242ef29e70be3e7bc0000000000000000000000000000000000000000000000000de0b6b3a7640000',
            gas: '0xd96b',
            maxFeePerGas: '0x52d4cb1bc',
            maxPriorityFeePerGas: '0x59682f00',
            type: '0x2',
          },
          origin: 'metamask',
          type: 'transfer',
          userFeeLevel: 'medium',
          defaultGasEstimates: {
            estimateType: 'medium',
            gas: '0xd96b',
            maxFeePerGas: '0x52d4cb1bc',
            maxPriorityFeePerGas: '0x59682f00',
          },
        },
      },
    };

    const store = configureStore([thunk])(sendTokenState);

    const props = {
      assetStandard: 'ERC20',
    };

    const { getByTitle } = renderWithProvider(
      <ConfirmSendToken {...props} />,
      store,
    );
    waitFor(() => {
      expect(getByTitle('0 ETH')).toBeInTheDocument();
    });
  });
});
