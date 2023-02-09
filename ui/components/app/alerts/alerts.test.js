import React from 'react';
import configureMockStore from 'redux-mock-store';
import initializedState from '../../../../test/data/mock-state.json';
import { renderWithProvider } from '../../../../test/lib/render-helpers';
import Alerts from '.';

describe('Alerts', () => {
  it('should render invalid custom network component with invalidCustomNetwork state is open', () => {
    const mockState = {
      invalidCustomNetwork: {
        state: 'OPEN',
        networkName: '',
      },
      unconnectedAccount: {
        state: 'CLOSED',
      },
      metamask: {},
    };

    const mockStore = configureMockStore()(mockState);

    const props = {
      history: {
        push: jest.fn(),
      },
    };

    const { queryByText } = renderWithProvider(
      <Alerts {...props} />,
      mockStore,
    );

    const invalidCustomNetwork = queryByText('Invalid custom network');
    expect(invalidCustomNetwork).toBeInTheDocument();
  });

  it('should render invalid custom network with both invalidCustomNetwork and unconnectedAccount state is open', () => {
    const mockState = {
      invalidCustomNetwork: {
        state: 'OPEN',
        networkName: '',
      },
      unconnectedAccount: {
        state: 'OPEN',
      },
      metamask: {},
    };

    const mockStore = configureMockStore()(mockState);

    const props = {
      history: {
        push: jest.fn(),
      },
    };

    const { queryByText } = renderWithProvider(
      <Alerts {...props} />,
      mockStore,
    );

    const invalidCustomNetwork = queryByText('Invalid custom network');
    expect(invalidCustomNetwork).toBeInTheDocument();
  });

  it('should render with unconnected account alter with unconnectedAccount state is open', () => {
    const mockState = {
      ...initializedState,
      invalidCustomNetwork: {
        state: 'CLOSED',
        networkName: '',
      },
      unconnectedAccount: {
        state: 'OPEN',
      },
      metamask: {
        ...initializedState.metamask,
      },
    };

    const mockStore = configureMockStore()(mockState);

    const props = {
      history: {
        push: jest.fn(),
      },
    };

    const { queryByText } = renderWithProvider(
      <Alerts {...props} />,
      mockStore,
    );

    const unconnectedAccountAlert = queryByText(
      'Your current account is not connected',
    );

    expect(unconnectedAccountAlert).toBeInTheDocument();
  });
});
