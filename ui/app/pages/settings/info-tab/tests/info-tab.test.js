import React from 'react'
import assert from 'assert'
import sinon from 'sinon'
import { mount } from 'enzyme'
import InfoTab from '../index'

describe('Info Tab', () => {
  let wrapper

  const versionNumber = '1.0.0'

  beforeEach(() => {

    global.platform = { getVersion: sinon.stub().returns(versionNumber) }

    wrapper = mount(
      <InfoTab />, {
        context: {
          t: str => str,
        },
      }
    )
  })

  afterEach(() => {
    global.platform.getVersion.reset()
  })

  it('renders', () => {
    assert.equal(wrapper.length, 1)
  })

  it('renders metamask version number', () => {
    const versionInfo = wrapper.find('.info-tab__version-number')
    assert.equal(versionInfo.text(), versionNumber)
  })

  it('render privacy info link with appropriate link', () => {
    const privacyMsg = wrapper.find('.info-tab__link-item').at(0)

    assert.equal(privacyMsg.children().prop('href'), 'https://metamask.io/privacy.html')
  })

  it('render terms info link with appropriate link', () => {
    const terms = wrapper.find('.info-tab__link-item').at(1)

    assert.equal(terms.children().prop('href'), 'https://metamask.io/terms.html')
  })

  it('render attributions info link with appropriate link', () => {
    const attributions = wrapper.find('.info-tab__link-item').at(2)

    assert.equal(attributions.children().prop('href'), 'https://metamask.io/attributions.html')
  })

  it('render support info link with appropriate link', () => {
    const support = wrapper.find('.info-tab__link-item').at(3)

    assert.equal(support.children().prop('href'), 'https://support.metamask.io')
  })

  it('render metamask website info link with appropriate link', () => {
    const mmWebsite = wrapper.find('.info-tab__link-item').at(4)

    assert.equal(mmWebsite.children().prop('href'), 'https://metamask.io/')
  })

  it('render email info link with appropriate link', () => {
    const email = wrapper.find('.info-tab__link-item').at(5)

    assert.equal(email.children().prop('href'), 'mailto:help@metamask.io?subject=Feedback')
  })
})
