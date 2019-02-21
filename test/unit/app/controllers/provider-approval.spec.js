import assert from 'assert'
import sinon from 'sinon'
import ObservableStore from 'obs-store'
import KeyringController from 'eth-keyring-controller'
import PreferencesController from '../../../../app/scripts/controllers/preferences'

import ProviderApprovalController from '../../../../app/scripts/controllers/provider-approval'

const TEST_SEED = 'debris dizzy just program just float decrease vacant alarm reduce speak stadium'


describe('Provider Approval', () => {
  let providerApproval
  const origin = 'test.origin'

  beforeEach(() => {
    const network = {providerStore: new ObservableStore({ type: 'mainnet' })}

    providerApproval = new ProviderApprovalController({
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

  it('checks if the origin request has been approved before', () => {
    const result = [{
      action: 'answer-is-approved',
      isApproved: true,
      caching: true,
    }, { active: true }]

    providerApproval.approveProviderRequest(origin)
    providerApproval._handleIsApproved(origin)
    assert.deepEqual(providerApproval.platform.sendMessage.getCall(1).args, result)
  })

  it('checks if the keyring is unlocked, returns false if no keyring is initialized', () => {
    const result = [
      { action: 'answer-is-unlocked', isUnlocked: false },
      { active: true },
    ]

    providerApproval._handleIsUnlocked()
    assert.deepEqual(providerApproval.platform.sendMessage.getCall(0).args, result)
  })

  it('checks if the keyring is unlocked, returns trur if keyring is initialized', () => {
    const password = 'a-fake-password'

    const result = [
      { action: 'answer-is-unlocked', isUnlocked: true },
      { active: true },
    ]

    providerApproval.keyringController.createNewVaultAndRestore(password, TEST_SEED)
    providerApproval._handleIsUnlocked()
    assert.deepEqual(providerApproval.platform.sendMessage.getCall(0).args, result)
  })

  it('enables privacy mode automatically when privacy mode in preferences is undefined, returns selected address from publicConfig', () => {
    const result = [
      { action: 'approve-legacy-provider-request', selectedAddress: 'test' },
      { active: true },
    ]

    providerApproval._handlePrivacyRequest()
    assert.deepEqual(providerApproval.platform.sendMessage.getCall(0).args, result)
  })

  it('adds origin to approvedOrigins in providerApproval', () => {
    providerApproval.approveProviderRequest(origin)
    assert.deepEqual(providerApproval.approvedOrigins, { 'test.origin': true })
  })


  it('clear approved origin from approvedOrigins if rejected', () => {
    // Approved two origin
    providerApproval.approveProviderRequest(origin)
    providerApproval.approveProviderRequest('test2.origin')

    // Reject first approved origin
    providerApproval.rejectProviderRequest(origin)

    assert.deepEqual(providerApproval.approvedOrigins, { 'test2.origin': true })
    assert.equal(providerApproval.closePopup.callCount, 3)
  })

  it('sets empty object/clear approvedOrigins', () => {
    // Approved two origin
    providerApproval.approveProviderRequest(origin)
    providerApproval.approveProviderRequest('test2.origin')

    providerApproval.clearApprovedOrigins()
    assert.deepEqual(providerApproval.approvedOrigins, {})
  })

  it('returns true if privacyMode is not set', () => {
    const expose = providerApproval.shouldExposeAccounts(origin)
    assert.equal(expose, true)
  })

  it('returns true if privacyMode is set to false', () => {
    providerApproval.preferencesController.store.updateState({featureFlags: { privacyMode: false }})
    const expose = providerApproval.shouldExposeAccounts(origin)
    assert.equal(expose, true)
  })

  it('returns undefined if origin is not in approvedOrigins, and privacyMode is set to true', () => {
    providerApproval.preferencesController.store.updateState({featureFlags: { privacyMode: true }})
    const expose = providerApproval.shouldExposeAccounts(origin)
    assert.equal(expose, undefined)
  })

  it('returns true if origin in approvedOrigins, and privacyMode is set to true', () => {
    providerApproval.preferencesController.store.updateState({featureFlags: { privacyMode: true }})
    providerApproval.approveProviderRequest(origin)

    const expose = providerApproval.shouldExposeAccounts(origin)
    assert.equal(expose, true)
  })

  it('sends message action that metamask is set to locked', () => {
    const result = [ { action: 'metamask-set-locked' } ]

    providerApproval.setLocked()
    assert.deepEqual(providerApproval.platform.sendMessage.getCall(0).args, result)
  })

})
