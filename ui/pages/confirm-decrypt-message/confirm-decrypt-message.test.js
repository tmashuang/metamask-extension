import React from 'react';
import configureMockStore from 'redux-mock-store';
import { screen } from '@testing-library/react';
import mockState from '../../../test/data/mock-state.json';
import { renderWithProvider } from '../../../test/lib/render-helpers';
import {
  goHome,
  clearConfirmTransaction,
  decryptMessage,
  cancelDecryptMessage,
  decryptMessageInline,
} from '../../store/actions';
import ConfirmDecryptMessage from '.';

jest.mock('../../store/actions.js', () => ({
  goHome: jest.fn(),
  clearConfirmTransaction: jest.fn(),
  decryptMessage: jest.fn(),
  cancelDecryptMessage: jest.fn(),
  decryptMessageInline: jest.fn(),
}));

describe('Name of the group', () => {
  mockState.metamask.unapprovedTxs = {};
  mockState.metamask.unapprovedDecryptMsgs = {
    3410401306301243: {
      id: 3410401306301243,
      msgParams: {
        from: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
        data:
          '0x7b2276657273696f6e223a227832353531392d7873616c736132302d706f6c7931333035222c226e6f6e6365223a2255327179495a5162364862787962464a572b4e62395932324167736439724b76222c22657068656d5075626c69634b6579223a224a67627377662f313758495873363167784152764e474549495530506161344d49314c544b6b69644c576b3d222c2263697068657274657874223a22617370337154445650583742414f616d4a77317276794e7a727558756541306859796d45227d',
        origin: 'test.dapp',
      },
      time: 1658961080441,
      status: 'unapproved',
      type: 'eth_decrypt',
      rawData: 'hello there',
    },
  };
  const store = configureMockStore()(mockState);

  it('should', () => {
    const { container } = renderWithProvider(<ConfirmDecryptMessage />, store);
    // screen.debug();
    expect(container).toMatchSnapshot();
  });
});
