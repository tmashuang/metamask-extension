import assert from 'assert'

import { firstTimeFlow, confirmSeedPhase } from './lib/flows/first-time-flow'
import accountInfo from './lib/flows/account-info'
import { balanceChecker, clickByText } from './lib/helpers'

const {
  verboseReportOnFailure,
  // setupFetchMocking,
  prepareExtensionForTesting,
} = require('./helpers')
const Ganache = require('./ganache')

const {
  backupNow,
} = require('../../app/_locales/en/messages.json')

const ganacheServer = new Ganache()

describe('MetaMask', function () {
  let driver, page, dapp
  let publicAddress

  this.timeout(0)
  this.bail(true)

  before(async function () {
    await ganacheServer.start({
      accounts: [
        {
          secretKey: '0x250F458997A364988956409A164BA4E16F0F99F916ACDD73ADCD3A1DE30CF8D1',
          balance: 0,
        },
        {
          secretKey: '0x53CB0AB5226EEBF4D872113D98332C1555DC304443BEE1CF759D15798D3C55A9',
          balance: 25000000000000000000,
        },
      ],
    })
    const result = await prepareExtensionForTesting()
    driver = await result.driver
    const pages = await driver.pages()
    page = pages[0]
    // await setupFetchMocking(driver)
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

  describe('First time flow skipping seed phrase challenge', () => {
    it('creates account in first time flow', async () => {
      const skipChallenge = true
      await firstTimeFlow(page, 'create', skipChallenge)
    })

    it('gets account address', async () => {
      publicAddress = await accountInfo(page)
    })
  })

  describe('Dapp Context', () => {
    it('switches to a dapp', async () => {
      dapp = await driver.newPage()
      await dapp.goto('localhost:8080')
      await dapp.waitFor('#address')
    })

    it('sends eth to the current account', async () => {
      await dapp.type('#address', publicAddress)
      await dapp.click('#send')
    })
  })

  describe('MetaMask Context', () => {
    it('switches back to MetaMask', async () => {
      await page.bringToFront()
    })

    it('checks balance', async () => {
      const expectedBalance = '1 ETH'
      const selector = '.currency-display-component.token-amount'
      // Wait to receive ETH
      await page.waitFor(5000)
      assert.equal(await balanceChecker(page, selector), expectedBalance)
    })

    it('click back up message from notification modal', async () => {
      await clickByText(page, backupNow.message)
    })

    it('reveal and confirm seed phrase challenge', async () => {
      await confirmSeedPhase(page)
    })

    it('backup notification is not rendered again', async () => {
      const element = await page.$$('.backup-notification')
      assert.equal(element.length, 0)
    })

  })
})
