import React from 'react';
import { renderWithProvider } from '../../../../../test/lib/render-helpers';
import SeedPhraseIntro from '.';

describe('Name of the group', () => {
  it('should', () => {
    const { container } = renderWithProvider(<SeedPhraseIntro />);

    expect(container).toMatchSnapshot();
  });
});
