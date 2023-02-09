import React from 'react';
import { screen } from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import mockState from '../../../test/data/mock-state.json';
import { renderWithProvider } from '../../../test/lib/render-helpers';
import ConfirmApprove from '.';

describe('Name of the group', () => {
  const store = configureMockStore()(mockState);
  it('should', () => {
    const props = {
      transaction: {
        txParams: {
          data: '',
          to: '',
          from: '',
        },
      },
    };

    renderWithProvider(<ConfirmApprove {...props} />, store);

    screen.debug();
  });
});
