import assert from 'assert'
import React from 'react'
import sinon from 'sinon'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import { screen, fireEvent } from '@testing-library/react'
import render from '../../../../../test/lib/render-helpers'
import TokenCell from '.'

xdescribe('Token Cell', function () {

  const state = {
    metamask: {
      currentCurrency: 'usd',
      selectedAddress: '0xAddress',
      contractExchangeRates: {
        '0xAnotherToken': 0.015,
      },
      conversionRate: 7.00,
      preferences: {},
      provider: {
        chainId: '1',
        ticker: 'ETH',
        type: 'mainnet',
      },
    },
    appState: {
      sidebar: {
        isOpen: true,
      },
    },
  }

  const store = configureMockStore([thunk])(state)

  const props = {
    address: '0xAnotherToken',
    decimals: 6,
    symbol: 'TEST',
    string: '5.000',
    currentCurrency: 'usd',
    image: 'test-image',
    onClick: sinon.spy(),
  }

  afterEach(function () {
    sinon.restore()
  })

  it('renders token balance and symbol', function () {
    render(<TokenCell {...props} />, store)

    const tokenAmount = screen.getByText('5.000 TEST')

    assert(tokenAmount)
  })

  it('renders converted fiat amount', function () {
    render(<TokenCell {...props} />, store)

    const tokenFiatAmount = screen.getByText('$0.52 USD')

    assert(tokenFiatAmount)
  })

  it('updates send token', function () {
    render(<TokenCell {...props} />, store)

    const sendTokenButton = screen.getByRole('button')
    fireEvent.click(sendTokenButton)

    assert.deepEqual(store.getActions()[0],
      {
        type: 'UPDATE_SEND_TOKEN',
        value: {
          address: '0xAnotherToken',
          decimals: 6,
          symbol: 'TEST',
        },
      })
  })
})
