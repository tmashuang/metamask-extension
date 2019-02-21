const { shallow, mount } = require('enzyme')
import { MemoryRouter } from 'react-router-dom'
import { shape } from 'prop-types'

module.exports = {
  shallowWithStore,
  mountWithStore,
  mountWithRouter,
}

function shallowWithStore (component, store) {
  const context = {
    store,
  }
  return shallow(component, {context})
}

function mountWithStore (component, store) {
  const context = {
    store,
  }
  return mount(component, {context})
}

function mountWithRouter (node) {

  // Instantiate router context
  const router = {
    history: new MemoryRouter().history,
    route: {
      location: {},
      match: {},
    },
  }

  const createContext = () => ({
    context: { router, t: str => str + '_t' },
    childContextTypes: { router: shape({}), t: () => {} },
  })

  return mount(node, createContext())
}
