import assert from 'assert'
import sinon from 'sinon'
import ObservableStore from 'obs-store'
import KeyringController from 'eth-keyring-controller'
import PreferencesController from '../../../../app/scripts/controllers/preferences'

import ProviderApprovalController from '../../../../app/scripts/controllers/provider-approval'

const TEST_SEED = 'debris dizzy just program just float decrease vacant alarm reduce speak stadium'

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
      preferencesController: new PreferencesController({ network }),
      platform: {
        sendMessage: sinon.spy(),
      },
      openPopup: sinon.spy(),
      closePopup: sinon.spy(),
    })

  })

  it('opens popup when _handleProviderRequest is called', () => {
    providerApproval._handleProviderRequest()
    assert.equal(providerApproval.openPopup.callCount, 1)
  })

  it('checks if the keyring is unlocked, returns false if no keyring is initialized', () => {
    const result = [
      { action: 'answer-is-unlocked', isUnlocked: false },
      { id: undefined },
    ]

    providerApproval._handleIsUnlocked()
    assert.deepEqual(providerApproval.platform.sendMessage.getCall(0).args, result)
  })

  it('checks if the keyring is unlocked, returns trur if keyring is initialized', () => {
    const password = 'a-fake-password'

    const result = [
      { action: 'answer-is-unlocked', isUnlocked: true },
      { id: undefined },
    ]

    providerApproval.keyringController.createNewVaultAndRestore(password, TEST_SEED)
    providerApproval._handleIsUnlocked()
    assert.deepEqual(providerApproval.platform.sendMessage.getCall(0).args, result)
  })

  it('enables privacy mode automatically when privacy mode in preferences is undefined, returns selected address from publicConfig', () => {
    const result = [
      { action: 'approve-legacy-provider-request', selectedAddress: 'test' },
      { id: undefined },
    ]

    providerApproval._handlePrivacyRequest()
    assert.deepEqual(providerApproval.platform.sendMessage.getCall(0).args, result)
  })

  it('adds origin to approvedOrigins in providerApproval', () => {
    providerApproval._handleProviderRequest('test.origin', 'Title', 'Image', false, 1)
    providerApproval.approveProviderRequest(1)

    assert.deepEqual(providerApproval.approvedOrigins, { 'test.origin': true })
  })


  it('clear approved origin from approvedOrigins if rejected', () => {
    providerApproval._handleProviderRequest('test.origin', 'Title', 'Image', false, 1)
    providerApproval.rejectProviderRequest(1)

    assert.deepEqual(providerApproval.approvedOrigins, {})
  })

  it('sets empty object/clear approvedOrigins', () => {
    // Approved two origins
    providerApproval._handleProviderRequest('test.origin', 'Title', 'Image', false, 1)
    providerApproval.approveProviderRequest(1)
    providerApproval._handleProviderRequest('test.origin2', 'Title2', 'Image2', false, 2)
    providerApproval.approveProviderRequest(2)

    assert.equal(Object.keys(providerApproval.approvedOrigins).length, 2)
    providerApproval.clearApprovedOrigins()
    assert.deepEqual(providerApproval.approvedOrigins, {})
  })

  it('returns true if privacyMode is not set', () => {
    providerApproval._handleProviderRequest('test.origin', 'Title', 'Image', false, 1)
    providerApproval.approveProviderRequest(1)

    const expose = providerApproval.shouldExposeAccounts('test.origin')
    assert.equal(expose, true)
  })

  it('returns true if privacyMode is set to false', () => {
    providerApproval._handleProviderRequest('test.origin', 'Title', 'Image', false, 1)
    providerApproval.approveProviderRequest(1)

    providerApproval.preferencesController.store.updateState({featureFlags: { privacyMode: false }})

    const expose = providerApproval.shouldExposeAccounts('test.origin')
    assert.equal(expose, true)
  })

  it('sends message action that metamask is set to locked', () => {
    const result = [ { action: 'metamask-set-locked' } ]

    providerApproval.setLocked()
    assert.deepEqual(providerApproval.platform.sendMessage.getCall(0).args, result)
  })

})
