import assert from 'assert'

const {
  // checkBrowserForConsoleErrors,
  verboseReportOnFailure,
  // setupFetchMocking,
  prepareExtensionForTesting,
} = require('./helpers')
const Ganache = require('./ganache')

const {
  connect,
  ropsten,
  submit,
} = require('../../app/_locales/en/messages.json')

import { firstTimeFlow } from './lib/flows/first-time-flow'
import { switchAccount } from './view/account-menu/index'
import { clickByText } from './lib/helpers'

const ganacheServer = new Ganache()

describe('MetaMask', function () {
  let driver, page, dapp, newTab

  const testAccount1 = '0x0cc5261ab8ce458dc977078a3623e2badd27afd3'
  const testAccount2 = '0x3ed0ee22e0685ebbf07b2360a8331693c413cc59'

  this.timeout(0)
  this.bail(true)

  before(async function () {
    await ganacheServer.start({
      accounts: [
        {
          secretKey: '0x53CB0AB5226EEBF4D872113D98332C1555DC304443BEE1CF759D15798D3C55A9',
          balance: 25000000000000000000,
        },
      ],
    })
    const result = await prepareExtensionForTesting()
    driver = result.driver
    const pages = await driver.pages()
    page = pages[0]
    // await setupFetchMocking(driver) // Find alternative for this in puppeteer
  })

  afterEach(async function () {
    // if (process.env.SELENIUM_BROWSER === 'chrome') {
    //   const errors = await checkBrowserForConsoleErrors(driver)
    //   if (errors.length) {
    //     const errorReports = errors.map(err => err.message)
    //     const errorMessage = `Errors found in browser console:\n${errorReports.join('\n')}`
    //     console.error(new Error(errorMessage))
    //   }
    // }
    if (this.currentTest.state === 'failed') {
      await verboseReportOnFailure(page, this.currentTest)
    }
  })

  after(async function () {
    await ganacheServer.quit()
    await driver.close()
  })

  describe('Going through the first time flow, but skipping the seed phrase challenge', () => {
    it('first time flow', async () => {
      await firstTimeFlow(page, 'import') 
    })
  })

  describe('puppeter listening for events', () => {
    it('switches to a dapp', async () => {
      dapp = await driver.newPage()
      await dapp.goto('localhost:8080')
      const dappElement = `//h1[contains(text(), 'E2E Test Dapp')]`
      await dapp.waitFor(dappElement)
    })

    it('click connect', async () => {
      const connectElement = `//button[contains(text(), '${connect.message}')]`
      const connectButton = await dapp.$x(connectElement)
      await connectButton[0].click()
    })
  })

  describe('connect screen', () => {
    it('connects to popup screen', async () => {
      const newPagePromise = new Promise(x => driver.once('targetcreated', target => x(target.page())))
      newTab = await newPagePromise

      await newTab.waitFor(1000)
      await newTab.bringToFront()
      await clickByText(newTab, 'Account 1')

      await clickByText(newTab, submit.message)
      await page.waitFor(2000)
    })
  })

  describe('Ethereum.on network, chainId, account changing', () => {

    describe('Network changing', () => {

      it('changes network', async () => {
        await page.bringToFront()
        await page.waitFor(500)

        await page.evaluate(() => document.querySelector('.network-indicator').click())
        await page.waitFor('.menu-droppo')

        const ropstenElement = `//span[contains(text(), '${ropsten.message}')]`
        const ropstenButton = await page.$x(ropstenElement)
        await ropstenButton[0].click()
      })

      it('updates the network to Ropsten within dapp', async () => {
        await dapp.bringToFront()
        await dapp.waitFor(1000)

        const dappNetwork = await dapp.evaluate(() => document.querySelector('#network').innerText)
        assert.equal(dappNetwork, '3')
      })

      it('updates the chainId to Ropsten within dapp', async () => {
        const dappChainId = await dapp.evaluate(() => document.querySelector('#chainId').innerText)
        assert.equal(dappChainId, '0x3')
      })

    })

    xdescribe('Account Changing', () => {

      it('confirms account is provided to dapp', async () => {
        const dappAccount = await dapp.evaluate(() => document.querySelector('#accounts').innerText)
        assert.equal(dappAccount, testAccount1)
      })

      it('switches to account 2', async () => {
        await page.bringToFront()
        await page.waitFor(500)

        const account2 = 'Account 2'
        await switchAccount(page, account2)
      })

      it('update the account on the dapp', async () => {
        await dapp.bringToFront()
        await page.waitFor(500)
        const dappAccount = await dapp.evaluate(() => document.querySelector('#accounts').innerText)
        assert.equal(dappAccount, testAccount2)
      })

    })

  })

})
