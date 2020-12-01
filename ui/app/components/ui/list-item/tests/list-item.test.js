import { shallow } from 'enzyme'
import React from 'react'
import ListItem from '../list-item.component'
import assert from 'assert'
import Sinon from 'sinon'
import Preloader from '../../icon/preloader/preloader-icon.component'
import Send from '../../icon/send-icon.component'

const TITLE = 'Hello World'
const SUBTITLE = <p>I am a list item</p>
const CLASSNAME = 'list-item-test'
const RIGHT_CONTENT = <p>Content rendered to the right</p>
const CHILDREN = <button>I am a button</button>
const MID_CONTENT = <p>Content rendered in the middle</p>

describe('ListItem', () => {
  let wrapper
  let clickHandler
  beforeAll(() => {
    clickHandler = Sinon.fake()
    wrapper = shallow(
      <ListItem
        className={CLASSNAME}
        title={TITLE}
        data-testid="test-id"
        subtitle={SUBTITLE}
        rightContent={RIGHT_CONTENT}
        midContent={MID_CONTENT}
        icon={<Send />}
        titleIcon={<Preloader />}
        onClick={clickHandler}
      >
        {CHILDREN}
      </ListItem>,
    )
  })
  it('includes the data-testid', () => {
    assert.equal(wrapper.props()['data-testid'], 'test-id')
  })
  it(`renders "${TITLE}" title`, () => {
    assert.equal(wrapper.find('.list-item__heading h2').text(), TITLE)
  })
  it('adds html title to heading element', () => {
    assert.equal(wrapper.find('.list-item__heading').props().title, TITLE)
  })
  it(`renders "I am a list item" subtitle`, () => {
    assert.equal(wrapper.find('.list-item__subheading').text(), 'I am a list item')
  })
  it('attaches external className', () => {
    assert(wrapper.props().className.includes(CLASSNAME))
  })
  it('renders content on the right side of the list item', () => {
    assert.equal(wrapper.find('.list-item__right-content p').text(), 'Content rendered to the right')
  })
  it('renders content in the middle of the list item', () => {
    assert.equal(wrapper.find('.list-item__mid-content p').text(), 'Content rendered in the middle')
  })
  it('renders list item actions', () => {
    assert.equal(wrapper.find('.list-item__actions button').text(), 'I am a button')
  })
  it('renders the title icon', () => {
    assert(wrapper.find(Preloader))
  })
  it('renders the list item icon', () => {
    assert(wrapper.find(Send))
  })
  it('handles click action and fires onClick', () => {
    wrapper.simulate('click')
    assert.equal(clickHandler.callCount, 1)
  })

  afterAll(() => {
    Sinon.restore()
  })
})
