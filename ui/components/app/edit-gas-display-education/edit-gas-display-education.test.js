import React from 'react';
import { renderWithProvider } from '../../../../test/lib/render-helpers';
import EditGasDisplayEducation from '.';

describe('Edit Gas Display Education', () => {
  it('should match snapshot', () => {
    const { container } = renderWithProvider(<EditGasDisplayEducation />);
    expect(container).toMatchSnapshot();
  });
});
