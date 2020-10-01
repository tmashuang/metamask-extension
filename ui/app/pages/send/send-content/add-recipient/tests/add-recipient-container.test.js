import assert from 'assert'
import sinon from 'sinon'

let mapStateToProps
let mapDispatchToProps

const actionSpies = {
  updateSendTo: sinon.spy(),
}

jest.mock('react-redux', () => ({
  connect: (ms, md) => {
    mapStateToProps = ms
    mapDispatchToProps = md
    return () => ({})
  }
}));

jest.mock('../../../../selectors', () => ({
  getSendEnsResolution: (s) => `mockSendEnsResolution:${s}`,
  getSendEnsResolutionError: (s) => `mockSendEnsResolutionError:${s}`,
  getAddressBook: (s) => [{ name: `mockAddressBook:${s}` }],
  getAddressBookEntry: (s) => `mockAddressBookEntry:${s}`,
  accountsWithSendEtherInfoSelector: (s) => `mockAccountsWithSendEtherInfoSelector:${s}`
}));

jest.mock('../../../../store/actions', () => actionSpies);

require('../add-recipient.container.js')

describe('add-recipient container', () => {
  describe('mapStateToProps()', () => {
    it('should map the correct properties to props', () => {
      assert.deepEqual(mapStateToProps('mockState'), {
        addressBook: [{ name: 'mockAddressBook:mockState' }],
        contacts: [{ name: 'mockAddressBook:mockState' }],
        ensResolution: 'mockSendEnsResolution:mockState',
        ensResolutionError: 'mockSendEnsResolutionError:mockState',
        ownedAccounts: 'mockAccountsWithSendEtherInfoSelector:mockState',
        addressBookEntryName: undefined,
        nonContacts: [],
      })
    })
  })

  describe('mapDispatchToProps()', () => {
    describe('updateSendTo()', () => {
      const dispatchSpy = sinon.spy()
      const mapDispatchToPropsObject = mapDispatchToProps(dispatchSpy)

      it('should dispatch an action', () => {
        mapDispatchToPropsObject.updateSendTo('mockTo', 'mockNickname')
        assert(dispatchSpy.calledOnce)
        assert(actionSpies.updateSendTo.calledOnce)
        assert.deepEqual(
          actionSpies.updateSendTo.getCall(0).args,
          ['mockTo', 'mockNickname'],
        )
      })
    })
  })
})
