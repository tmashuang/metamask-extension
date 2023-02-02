import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import mockState from '../../../../test/data/mock-state.json';
import { renderWithProvider } from '../../../../test/lib/render-helpers';
import { updateCollectibleDropDownState } from '../../../store/actions';
import CollectiblesItems from '.';

jest.mock('../../../store/actions.js', () => ({
  ...jest.requireActual('../../../store/actions.js'),
  updateCollectibleDropDownState: jest.fn().mockReturnValue(jest.fn()),
}));

const COLLECTIBLES = [
  {
    address: '0x495f947276749Ce646f68AC8c248420045cb7b5e',
    tokenId:
      '58076532811975507823669075598676816378162417803895263482849101575514658701313',
    name: 'Punk #4',
    creator: {
      user: {
        username: null,
      },
      profile_img_url: null,
      address: '0x806627172af48bd5b0765d3449a7def80d6576ff',
      config: '',
    },
    description: 'Red Mohawk bam!',
    image:
      'https://lh3.googleusercontent.com/BdxvLseXcfl57BiuQcQYdJ64v-aI8din7WPk0Pgo3qQFhAUH-B6i-dCqqc_mCkRIzULmwzwecnohLhrcH8A9mpWIZqA7ygc52Sr81hE',
    standard: 'ERC1155',
  },
  {
    address: '0x495f947276749Ce646f68AC8c248420045cb7b5e',
    tokenId:
      '58076532811975507823669075598676816378162417803895263482849101574415147073537',
    name: 'Punk #3',
    creator: {
      user: {
        username: null,
      },
      profile_img_url: null,
      address: '0x806627172af48bd5b0765d3449a7def80d6576ff',
      config: '',
    },
    description: 'Clown PUNK!!!',
    image:
      'https://lh3.googleusercontent.com/H7VrxaalZv4PF1B8U7ADuc8AfuqTVyzmMEDQ5OXKlx0Tqu5XiwsKYj4j_pAF6wUJjLMQbSN_0n3fuj84lNyRhFW9hyrxqDfY1IiQEQ',
    standard: 'ERC1155',
  },
  {
    address: '0x495f947276749Ce646f68AC8c248420045cb7b5e',
    tokenId:
      '58076532811975507823669075598676816378162417803895263482849101573315635445761',
    name: 'Punk #2',
    creator: {
      user: {
        username: null,
      },
      profile_img_url: null,
      address: '0x806627172af48bd5b0765d3449a7def80d6576ff',
      config: '',
    },
    description: 'Got glasses and black hair!',
    image:
      'https://lh3.googleusercontent.com/CHNTSlKB_Gob-iwTq8jcag6XwBkTqBMLt_vEKeBv18Q4AoPFAEPceqK6mRzkad2s5djx6CT5zbGQwDy81WwtNzViK5dQbG60uAWv',
    standard: 'ERC1155',
  },
  {
    address: '0x495f947276749Ce646f68AC8c248420045cb7b5e',
    tokenId:
      '58076532811975507823669075598676816378162417803895263482849101572216123817985',
    name: 'Punk #1',
    creator: {
      user: {
        username: null,
      },
      profile_img_url: null,
      address: '0x806627172af48bd5b0765d3449a7def80d6576ff',
      config: '',
    },
    image:
      'https://lh3.googleusercontent.com/4jfPi-nQNWCUXD5qVNVWX7LX2UufU_elEJcvICFlsTdcBXv70asnDEOlI8oKECZxlXq1wseeIXMwmP5tLyOUxMKk',
    standard: 'ERC1155',
  },
  {
    address: '0x495f947276749Ce646f68AC8c248420045cb7b5e',
    tokenId:
      '58076532811975507823669075598676816378162417803895263482849101571116612190209',
    name: 'Punk #4651',
    creator: {
      user: {
        username: null,
      },
      profile_img_url: null,
      address: '0x806627172af48bd5b0765d3449a7def80d6576ff',
      config: '',
    },
    image:
      'https://lh3.googleusercontent.com/BdxvLseXcfl57BiuQcQYdJ64v-aI8din7WPk0Pgo3qQFhAUH-B6i-dCqqc_mCkRIzULmwzwecnohLhrcH8A9mpWIZqA7ygc52Sr81hE',
    standard: 'ERC1155',
  },
];

describe('Name of the group', () => {
  const mockStore = configureMockStore([thunk])(mockState);

  it('should', () => {
    const props = {
      collections: {
        '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc': {
          collectibles: COLLECTIBLES,
          collectionImage: '',
          collectionName: 'Collectible Collection',
        },
      },
      previouslyOwnedCollection: {
        collectibles: [],
      },
    };

    const { queryByTestId } = renderWithProvider(
      <CollectiblesItems {...props} />,
      mockStore,
    );

    const collectionExpanderButton = queryByTestId(
      'collection-expander-button',
    );

    fireEvent.click(collectionExpanderButton);

    expect(updateCollectibleDropDownState).toHaveBeenCalledWith(
      mockState.metamask.collectiblesDropdownState,
    );
  });
});
