import React from 'react';
import { useDispatch } from 'react-redux';
import { fireEvent, screen } from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { renderWithProvider } from '../../../../test/lib/render-helpers';
import { setFirstTimeFlowType } from '../../../store/actions';
import OnboardingWelcome from './welcome';

// const mockDispatch = jest.fn();

// jest.mock('react-redux', () => ({
//   useDispatch: () => mockDispatch,
// }));

// jest.mock('react-redux', () => {
//   const actual = jest.requireActual('react-redux');

//   return {
//     ...actual,
//     useDispatch: () => mockDispatch,
//   };
// });

const mockSetFirstTimeFlowType = jest.fn();

jest.mock('../../../store/actions.js', () => ({
  setFirstTimeFlowType: () => mockSetFirstTimeFlowType,
}));

describe.skip('Name of the group', () => {
  const mockState = {
    metamask: {},
  };

  const store = configureMockStore([thunk])(mockState);
  // const store = configureMockStore([thunk])(mockState);
  it('should render', () => {
    renderWithProvider(<OnboardingWelcome />);
    const onboardingWelcome = screen.queryByTestId('onboarding-welcome');
    expect(onboardingWelcome).toBeInTheDocument();
  });

  it('should create', () => {
    renderWithProvider(<OnboardingWelcome />, store);

    const createWallet = screen.getByTestId('onboarding-create-wallet');
    fireEvent.click(createWallet);

    expect(mockSetFirstTimeFlowType).toHaveBeenCalled();
    expect(mockSetFirstTimeFlowType).toHaveBeenCalledWith('');

    // console.log(store.getActions());
    // expect(spy).toHaveBeenCalledWith('create');
  });
});
