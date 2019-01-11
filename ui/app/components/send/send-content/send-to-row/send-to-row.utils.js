const {
  REQUIRED_ERROR,
  INVALID_RECIPIENT_ADDRESS_ERROR,
  INVALID_RECIPIENT_ADDRESS_NOT_ETH_NETWORK_ERROR,
} = require('../../send.constants')
const {
  isValidAddress,
  isEthNetwork,
} = require('../../../../util')

function getToErrorObject (to, toError = null, hasHexData = false, network) {
  if (!to) {
    if (!hasHexData) {
      toError = REQUIRED_ERROR
    }
  } else if (!isValidAddress(to, network) && !toError) {
    toError = isEthNetwork(network) ? INVALID_RECIPIENT_ADDRESS_ERROR : INVALID_RECIPIENT_ADDRESS_NOT_ETH_NETWORK_ERROR
  }

  return { to: toError }
}

module.exports = {
  getToErrorObject,
}
