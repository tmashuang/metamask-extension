// general
// connections
// advanced
// contacts
// security & privacy
// networks
// about

module.exports = {
  clickSettings,
  clickAdvanced,
}

const {
  settings,
  advanced,
} = require('../../../../app/_locales/en/messages.json')

import { clickByText } from '../../lib/helpers'

import { openAccountMenu } from '../../view/index'

async function clickSettings (page) {
  await openAccountMenu(page)
  await clickByText(page, settings.message)
  await page.waitFor('.settings-page__header')
}

async function clickAdvanced (page) {
  await clickByText(page, advanced.message)
  await clickToggle(page)
}

async function clickToggle (page, index = 0) {
  const toggleButtons = await page.$$('.toggle-button div')
  await toggleButtons[index].click()
}
