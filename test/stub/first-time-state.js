const { createTestProviderTools } = require('../stub/provider')

const providerResultStub = {}
const provider = createTestProviderTools({ scaffold: providerResultStub }).provider

//
// The test state of MetaMask
//
module.exports = {
  config: {},
  NetworkController: {
    provider: {
      type: provider,
    },
  },
}
