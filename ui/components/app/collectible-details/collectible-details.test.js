import { screen } from '@testing-library/react';
import React from 'react';
import configureMockStore from 'redux-mock-store';
import { renderWithProvider } from '../../../../test/lib/render-helpers';
import mockState from '../../../../test/data/mock-state.json';
import CollectibleDetails from './collectible-details';

jest.mock('../../../store/actions.js');

describe('Collectible Details', () => {
  const mockStore = configureMockStore()(mockState);

  it('should match minimal props and state snapshot', () => {
    const props = {
      collectible: {
        name: 'Non Fungible Token',
        address: '0xNFT',
        tokenId: '123',
      },
    };

    const { container } = renderWithProvider(
      <CollectibleDetails {...props} />,
      mockStore,
    );

    expect(container).toMatchSnapshot();
  });

  it.todo('should');
});
