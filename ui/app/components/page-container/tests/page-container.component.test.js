import React from 'react'
import assert from 'assert'
import sinon from 'sinon'
import { mountWithStore } from '../../../../../test/lib/render-helpers'
import PageContainer from '../page-container.component'
import PageContainerHeader from '../page-container-header'
import PageContainerFooter from '../page-container-footer'


describe('Page Container', () => {
  let wrapper

  const props = {
    backButtonString: 'Back Button String',
    backButtonStyles: {
      display: 'block',
    },
    headerCloseText: 'Header Close Text',
    onBackButtonClick: sinon.spy(),
    onClose: sinon.spy(),
    showBackButton: true,
    subtitle: 'Subtitle',
    title: 'Title',
    contentComponent: 'Test Content',
    cancelText: 'Cancel Text',
    disabled: false,
    hideCancel: false,
    onCancel: sinon.spy(),
    onSubmit: sinon.spy(),
    submitText: 'Submit Text',
  }

  beforeEach(() => {
    wrapper = mountWithStore(
      <PageContainer {...props} />
    )
  })

  describe('Page Container Header', () => {
    it('passes props to child header component', () => {
      const headerProps = wrapper.find(PageContainerHeader).props()
      assert.equal(headerProps.title, props.title)
      assert.equal(headerProps.subtitle, props.subtitle)
      assert.equal(headerProps.backButtonString, props.backButtonString)
      assert.equal(headerProps.headerCloseText, props.headerCloseText)
      assert.equal(headerProps.showBackButton, props.showBackButton)
      assert.equal(headerProps.backButtonStyles, props.backButtonStyles)
    })
  })

  describe('Page Content', () => {
    it('renders content component from container props', () => {
      const content = wrapper.find('.page-container__content').text()
      assert.equal(content, props.contentComponent)
    })
  })

  describe('Page Container Footer', () => {
    it('passes props to child footer component', () => {
      const footerProps = wrapper.find(PageContainerFooter).props()
      assert.equal(footerProps.cancelText, props.cancelText)
      assert.equal(footerProps.hideCancel, props.hideCancel)
      assert.equal(footerProps.submitText, props.submitText)
      assert.equal(footerProps.disabled, props.disabled)
    })
  })
})
