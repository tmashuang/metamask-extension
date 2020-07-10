import assert from 'assert'

import { firstTimeFlow } from './lib/flows/first-time-flow'
import { createsAccount } from './lib/flows/create-account-flow'
import { lock, unlock } from './lib/view/lock-unlock'
import { importSeedPhrase } from './lib/flows/import-seed-phrase'
import { sendTx } from './lib/flows/transaction/send'
import { transactionList, advancedGasInput } from './lib/flows/transaction/index'
import { textChecker, clickByText } from './lib/helpers'
import { settings } from './lib/view/account-menu'
import { enableAdvancedGasControls } from './lib/view/settings/index'

import { goHome } from './lib/view/index'

import {
  advanced,
  connect,
  next,
  send,
  confirm,
} from '../../app/_locales/en/messages.json'

const Ganache = require('./ganache')
const { buildWebDriver } = require('./webdriver')
const { accountDetails } = require('./lib/view/account-details')

const ganacheServer = new Ganache()

describe('Puppeteer', function () {

  let driver, page, dapp

  const password = 'correct horse battery staple'

  const testSeedPhrase = 'phrase upgrade clock rough situate wedding elder clever doctor stamp excess tent'

  this.timeout(0)
  this.bail(true)


  before(async function () {
    await ganacheServer.start()
    const result = await buildWebDriver()
    driver = result.driver
    page = result.extensionPage
  })

  after(async function () {
    // await ganacheServer.quit()
    // await driver.close()
  })


  describe('First Time flow create', function () {
    it('first', async function () {
      await firstTimeFlow(page, 'create')
    })
  })

  describe('account info', function () {
    it('account details menu shows correct account', async function () {
      await accountDetails(page)
    })
  })

  describe('lock', function () {
    it('locks', async function () {
      await lock(page)
    })
  })

  describe('unlock', function () {
    it('unlocks', async function () {
      await unlock(page, password)
    })
  })

  describe('create account', function () {
    it('click create account', async function () {
      const accountName = '2nd account'
      await createsAccount(page, accountName)

      const selectedAccountName = await page.$eval('.selected-account__name', (el) => el.innerText)
      assert.equal(selectedAccountName, accountName)
    })
  })

  describe('Import seed phrase', function () {
    it('imports seed phrase', async function () {
      await importSeedPhrase(page)
    })
  })

  describe('checks balance', function () {
    it('asdasd', async function () {
      const expectedBalance = '100'
      const selector = '.asset-list-item .list-item__heading'

      await textChecker(page, selector, expectedBalance)
    })
  })

  describe('Adds an entry to the address book and sends eth to that address', function () {
    it('te', async function () {

      const details = {
        address: '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
        amount: '1',
        gasOption: 'Average',
      }

      await sendTx(page, details)
    })

    it('asdasd', async function () {
      const expectedBalance = '98'
      const selector = '.asset-list-item .list-item__heading'
      await textChecker(page, selector, expectedBalance)
    })

    it('tx list length', async function () {
      const txList = await transactionList(page)
      assert.equal(txList.length, 1)
    })

    it('check tx list item value sent', async function () {
      const expectedText = '-1 ETH'
      const selector = '.transaction-list-item__primary-currency'
      await textChecker(page, selector, expectedText)
    })
  })

  describe('Send ETH from inside MetaMask using fast gas option', function () {
    it('test', async function () {
      const opts = {
        address: '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
        amount: '1',
        gasOption: 'Fast',
      }

      await sendTx(page, opts)
    })

    it('tx list length', async function () {
      const txList = await transactionList(page)
      assert.equal(txList.length, 2)
    })

    it('check tx list item value sent', async function () {
      const expectedText = '-1 ETH'
      const selector = '.transaction-list-item__primary-currency'
      await textChecker(page, selector, expectedText, 1)
    })
  })

  describe('internal send with advanced gas', function () {
    it('send with advanced', async function () {
      const opts = {
        address: '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
        amount: '1',
        gasPrice: '10',
        gasLimit: '25000',
        gasOption: 'Advanced',
      }
      await sendTx(page, opts)
    })

    it('tx list length', async function () {
      const txList = await transactionList(page)
      assert.equal(txList.length, 3)
    })

    it('check tx list item value sent', async function () {
      const expectedText = '-1 ETH'
      const selector = '.transaction-list-item__primary-currency'
      await textChecker(page, selector, expectedText, 2)
    })
  })

  describe('Settings', function () {
    it('navigate to advanced', async function () {
      await settings(page)
      await clickByText(page, advanced.message)
      await enableAdvancedGasControls(page)
      await goHome(page)
    })
  })

  describe('new page', function () {
    it('navigate to dapp', async function () {
      dapp = await driver.newPage()
      await dapp.goto('http://127.0.0.1:8080/')

      await clickByText(dapp, connect.message)
    })

    it('connect dapp to extension', async function () {
      const [,, popup] = await driver.pages()

      await clickByText(popup, next.message)
      await clickByText(popup, connect.message, 1) // use index 1 since there is mutiple connect messages on the confirm connect screen
    })

    it('initiates send from the dapp', async function () {
      await clickByText(dapp, send.message, 1)

      const [,, popup] = await driver.pages()
      await advancedGasInput(popup, '10', '25000')
      await await clickByText(popup, confirm.message)
    })
  })

})
