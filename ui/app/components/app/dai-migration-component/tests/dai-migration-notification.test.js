import React from 'react'
import assert from 'assert'
import sinon from 'sinon'
import { mount } from 'enzyme'
import DaiMigrationNotification from '../dai-migration-notification.component'

describe('DaiMigrationNotification', () => {
  let wrapper
  let windowStub

  const props = {
    setMkrMigrationReminderTimestamp: sinon.spy(),
    userAddress: '0xAddress',
    string: '2.00',
    symbol: 'SAI',
    tokenTrackerBalance: '2000000000000000000',
    token: {
      address: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
      decimals: 18,
      symbol: 'SAI',
    }
  }

  before(() => {
    windowStub = sinon.stub(window, 'open')
  })

  beforeEach(() => {
    wrapper = mount(
      <DaiMigrationNotification {...props} />, {
        context: {
          t: str => str,
        },
      },
    )
  })

  after(() => {
    sinon.restore()
  })

  it('navigates to migrate makerdao site when clicking migrate', () => {
    const migrateButton = wrapper.find('.button.btn-primary')

    migrateButton.simulate('click')

    assert(windowStub.calledOnce)
    assert.equal(windowStub.getCall(0).args[0], 'https://migrate.makerdao.com')
  })

  it('remind me later', () => {
    const remindLaterButton = wrapper.find('.button.btn-secondary')

    remindLaterButton.simulate('click')

    assert(props.setMkrMigrationReminderTimestamp.calledOnce)
  })
})
