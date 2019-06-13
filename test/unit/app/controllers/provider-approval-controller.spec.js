import assert from 'assert'
import sinon from 'sinon'
import ObservableStore from 'obs-store'
import KeyringController from 'eth-keyring-controller'
import PreferencesController from '../../../../app/scripts/controllers/preferences'

import ProviderApprovalController from '../../../../app/scripts/controllers/provider-approval'

describe('Provider Approval', () => {
  let providerApproval

  beforeEach(() => {
    const network = {providerStore: new ObservableStore({ type: 'test' })}

    providerApproval = new ProviderApprovalController({
      store: new ObservableStore({
        providerRequests: [],
      }),
      publicConfigStore: new ObservableStore({
        selectedAddress: 'test',
      }),
      keyringController: new KeyringController({}),
      preferencesController: new PreferencesController({
        network,
      }),
      openPopup: sinon.spy(),
      closePopup: sinon.spy(),
    })

  })

  it('opens popup when _handleProviderRequest is called', () => {
    providerApproval._handleProviderRequest()
    assert.equal(providerApproval.openPopup.callCount, 1)
  })

  it('adds origin to approvedOrigins in providerApproval', () => {
    providerApproval._handleProviderRequest('test.origin', 'Title', 'Image', false, 1)
    providerApproval.approveProviderRequestByOrigin('test.origin')

    assert.deepEqual(providerApproval.approvedOrigins, { 'test.origin': true })
  })


  it('clear approved origin from approvedOrigins if rejected', () => {
    providerApproval._handleProviderRequest('test.origin', 'Title', 'Image', false, 1)
    providerApproval.rejectProviderRequestByOrigin('test.origin')

    assert.deepEqual(providerApproval.approvedOrigins, {})
  })

  it('sets empty object/clear approvedOrigins', () => {
    // Approved two origins
    providerApproval._handleProviderRequest('test.origin', 'Title', 'Image', false, 1)
    providerApproval.approveProviderRequestByOrigin('test.origin')
    providerApproval._handleProviderRequest('test.origin2', 'Title2', 'Image2', false, 2)
    providerApproval.approveProviderRequestByOrigin('test.origin2')

    assert.equal(Object.keys(providerApproval.approvedOrigins).length, 2)
    providerApproval.clearApprovedOrigins()
    assert.deepEqual(providerApproval.approvedOrigins, {})
  })

  it('returns true if privacyMode is not set', () => {
    providerApproval.approveProviderRequestByOrigin('test.origin')

    const expose = providerApproval.shouldExposeAccounts('test.origin')
    assert.equal(expose, true)
  })

  it('returns true if privacyMode is set to false', () => {
    providerApproval.approveProviderRequestByOrigin('test.origin')

    providerApproval.preferencesController.store.updateState({ featureFlags: { privacyMode: false } })

    const expose = providerApproval.shouldExposeAccounts('test.origin')
    assert.equal(expose, true)
  })

})
