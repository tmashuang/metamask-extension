import React from 'react'
import { Provider } from 'react-redux'
import { mount } from 'enzyme'
import { MemoryRouter, Router } from 'react-router-dom'
import PropTypes from 'prop-types'

export function mountWithStore (component, store) {

  const createContext = () => ({
    context: {
      t: (str) => str,
      metricsEvent: () => {},
    },
    childContextTypes: {
      t: PropTypes.func,
      metricsEvent: PropTypes.func,
    },
  })

  const Wrapper = () => (
    <Provider store={store}>
      {component}
    </Provider>
  )

  return mount(<Wrapper />, createContext())
}

export function mountWithRouter (component, store = {}, pathname = '/') {

  // Instantiate router context
  const router = {
    history: new MemoryRouter().history,
    route: {
      location: {
        pathname: pathname,
      },
      match: {},
    },
  }

  const createContext = () => ({
    context: {
      router,
      t: (str) => str,
      metricsEvent: () => {},
    },
    childContextTypes: {
      router: PropTypes.object,
      t: PropTypes.func,
      metricsEvent: PropTypes.func,
    },
  })

  const Wrapper = () => (
    <MemoryRouter initialEntries={[{ pathname }]} initialIndex={0}>
      {component}
    </MemoryRouter>
  )

  return mount(<Wrapper />, createContext())
}

export function mountWithRouterHook (component, history = { push: () => {}, location: {}, listen: () => {} }) {

  const store = component.props.store

  const Wrapper = () => (
    <Router history={history}>
      {store ? (
        <Provider store={store}>
          { component }
        </Provider>
      ) : (
        component
      )}
    </Router>
  )

  return mount(<Wrapper />)
}
