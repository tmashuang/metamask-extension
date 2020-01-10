const assert = require('assert')
const webdriver = require('selenium-webdriver')
const { By, Key, until } = webdriver
const {
  assertElementNotPresent,
  checkBrowserForConsoleErrors,
  closeAllWindowHandlesExcept,
  delay,
  findElement,
  findElements,
  openNewPage,
  switchToWindowWithTitle,
  verboseReportOnFailure,
  waitUntilXWindowHandles,
  setupFetchMocking,
  prepareExtensionForTesting,
} = require('./helpers')
const Ganache = require('./ganache')

const {
  connect,
  submit,
  confirm,
  next,
  reject,
  rejectAll,
  contractDeployment,
  details,
  edit,
  advanced,
  save,
  requestsAwaitingAcknowledgement,
  addToken,
  addTokens,
  customToken,
} = require('../../app/_locales/en/messages.json')

import { firstTimeFlow } from './lib/flows/first-time-flow'
import accountInfo from './lib/flows/account-info'
import { logout, login } from './lib/flows/logout-login'
import { addAccount } from './view/account-menu'
import { checkAccountName, transactionList, transactionDetail, clickLogo } from './view/index'
import importSeedPhrase from './lib/flows/import-seed'
import { send, editGasPrice, editGasLimit } from './lib/flows/send'
import { balanceChecker, clickByText, navigateTx } from './lib/helpers'

import { clickSettings, clickAdvanced } from './view/settings'

const ganacheServer = new Ganache()

describe('MetaMask', function () {
  let driver, page, dapp, popup, tokenAddress

  const testSeedPhrase = 'phrase upgrade clock rough situate wedding elder clever doctor stamp excess tent'
  const tinyDelayMs = 200
  const regularDelayMs = tinyDelayMs * 2
  const largeDelayMs = regularDelayMs * 2

  this.timeout(0)
  this.bail(true)

  before(async function () {
    await ganacheServer.start()
    const result = await prepareExtensionForTesting()
    driver = result.driver
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
    // if (this.currentTest.state === 'failed') {
    //   await verboseReportOnFailure(driver, this.currentTest)
    // }
  })

  after(async function () {
    await ganacheServer.quit()
    // await driver.close()
  })

  describe('First Time flow create', () => {
    it('', async () => {
      await firstTimeFlow(page, 'create')
    })
  })

  describe('account info', () => {
    it('', async () => {
      await accountInfo(page)
    })
  })

  describe('logout and log back in', () => {
    it('', async () => {
      await logout(page)
    })

    it('', async () => {
      await login(page)
    })
  })

  describe('add account', () => {
    it('', async () => {
      await addAccount(page, '2nd account')
    })

    it('', async () => {
      const expectedAccountName = '2nd account'
      const accountName = await checkAccountName(page)
      assert.equal(accountName, expectedAccountName)
    })
  })

  describe('import seed', () => {
    it('', async () => {
      await importSeedPhrase(page, testSeedPhrase)
    })
  })

  describe('checks balance', () => {
    it('', async () => {
      const expectedBalance = '100 ETH'
      const selector = '.currency-display-component.token-amount'
      assert.equal(await balanceChecker(page, selector), expectedBalance)
    })
  })

  describe('Send with default gas', () => {
    it('', async () => {
      const opts = {
        address: '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
        amount: '1',
        gasOption: 'Average',
      }

      await send(page, opts)
    })

    it('', async () => {
      const txList = await transactionList(page)
      assert.equal(txList.length, 1)
    })
  })

  describe('send with fast gas option', () => {
    it('', async () => {
      const opts = {
        address: '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
        amount: '1',
        gasOption: 'Fast',
      }

      await send(page, opts)
    })

    it('', async () => {
      const txList = await transactionList(page)
      assert.equal(txList.length, 2)
    })
  })

  describe('internal send with advanced gas', () => {
    it('send with advanced', async () => {
      const opts = {
        address: '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
        amount: '1',
        gasPrice: '10',
        gasLimit: '25000',
        gasOption: 'Advanced',
      }
      await send(page, opts)
    })

    it('', async () => {
      const txList = await transactionList(page)
      assert.equal(txList.length, 3)
    })
  })

  describe('Advanced Controls', () => {
    it('toggles adavnced gas controls in settings', async () => {
      await clickSettings(page)
      await clickAdvanced(page)
      await clickLogo(page)
    })

  })

  describe('Dapp Context - Send from Dapp', () => {
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

    it('connects from new tab connect screen', async () => {
      const newPagePromise = new Promise(x => driver.once('targetcreated', target => x(target.page())))
      const connectScreen = await newPagePromise

      await connectScreen.waitFor(1000)
      await connectScreen.bringToFront()
      await clickByText(connectScreen, 'Account 1')

      await clickByText(connectScreen, submit.message)
    })

    it('initiates a send from the dapp', async () => {
      await clickByText(dapp, 'Send', 1)
    })

    it('', async () => {
      const pages = await driver.pages()
      popup = pages[pages.length - 1]

      await editGasPrice(popup, '10')
      await editGasLimit(popup, '25000')

      await clickByText(popup, confirm.message)
      await page.bringToFront()
    })

    it('', async () => {
      assert.equal(await transactionDetail(page, 'amount'), '-3 ETH')
      assert.equal(await transactionDetail(page, 'gasLimit'), '25000')
      assert.equal(await transactionDetail(page, 'gasPrice'), '10')
    })
  })

  describe('navigate tx', () => {
    let navigationText

    it('', async () => {
      await dapp.bringToFront()
      await clickByText(dapp, 'Send', 1)
      await clickByText(dapp, 'Deploy Contract')

      await clickByText(dapp, 'Send', 1)
      await clickByText(dapp, 'Deploy Contract')
    })

    it('', async () => {
      await page.bringToFront()
      await page.waitFor(500)
      const transactions = await page.$$('.transaction-list-item')
      await transactions[3].click()
    })

    it('', async () => {

      navigationText = await navigateTx(page)
      assert.equal(navigationText, `1 of 4\n${requestsAwaitingAcknowledgement.message}`)
    })

    it('', async () => {
      navigationText = await navigateTx(page, 2)
      assert.equal(navigationText, `2 of 4\n${requestsAwaitingAcknowledgement.message}`)

    })

    it('', async () => {
      navigationText = await navigateTx(page, 2)
      assert.equal(navigationText, `3 of 4\n${requestsAwaitingAcknowledgement.message}`)
    })

    it('', async () => {
      navigationText = await navigateTx(page, 0)
      assert.equal(navigationText, `1 of 4\n${requestsAwaitingAcknowledgement.message}`)
    })

    it('', async () => {
      navigationText = await navigateTx(page, 3)
      assert.equal(navigationText, `4 of 4\n${requestsAwaitingAcknowledgement.message}`)

    })


    it('', async () => {
      navigationText = await navigateTx(page, 1)
      assert.equal(navigationText, `3 of 4\n${requestsAwaitingAcknowledgement.message}`)

    })

    it('', async () => {
      navigationText = await navigateTx(page, 1)
      assert.equal(navigationText, `2 of 4\n${requestsAwaitingAcknowledgement.message}`)
    })

    it('', async () => {
      await dapp.bringToFront()
      await clickByText(dapp, 'Send', 1)

      await page.bringToFront()

      const navigationText = await navigateTx(page)
      assert.equal(navigationText, `3 of 5\n${requestsAwaitingAcknowledgement.message}`)
    })

    it('', async () => {
      await clickByText(page, `${confirm.message}`)
      const navigationText = await navigateTx(page)
      assert.equal(navigationText, `1 of 4\n${requestsAwaitingAcknowledgement.message}`)
    })

    it('', async () => {
      await clickByText(page, `${reject.message}`)
      const navigationText = await navigateTx(page)
      assert.equal(navigationText, `1 of 3\n${requestsAwaitingAcknowledgement.message}`)
    })

    it('', async () => {
      await page.click('footer a')
      await clickByText(page, `${rejectAll.message}`)
    })

    it('', async () => {
      const txList = await transactionList(page)
      assert.equal(txList.length, 5)
    })
  })

  describe('Deploy contract and call contract methods', () => {
    it('', async () => {
      await dapp.bringToFront()
      await dapp.click('#deployButton'
      )
    })

    it('', async () => {
      await page.bringToFront()
      await clickByText(page, `${contractDeployment.message}`)
      await clickByText(page, 'Data')

      const element = await page.$$('.confirm-page-container-content__data-box')
      const elementText = await element[1].evaluate(el => el.innerText)

      assert(elementText.match(
        /0x608060405234801561001057600080fd5b5033600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff/
      ))
    })

    it('', async () => {
      await clickByText(page, `${details.message}`)
      await clickByText(page, `${confirm.message}`)
    })

    it('', async () => {
      const txList = await transactionList(page)
      assert.equal(txList.length, 6)
    })

    it('', async () => {
      assert.equal(await transactionDetail(page, 'action'), 'Contract Deployment')
    })

    it('', async () => {
      await dapp.bringToFront()
      await dapp.waitForFunction(() => document.querySelector('#contractStatus').innerText.includes('Deployed'))

      await clickByText(dapp, 'Deposit')
      await dapp.waitForFunction(() => document.querySelector('#contractStatus').innerText.includes('Deposit initiated'))

      await page.bringToFront()
      await page.waitFor(500)

      const transactions = await page.$$('.transaction-list-item')
      await transactions[0].click()

      // Set the gas limit
      await clickByText(page, `${edit.message}`)
      await clickByText(page, `${advanced.message}`)
      await editGasLimit(page, '60001')
      await editGasPrice(page, '10')
      await clickByText(page, `${save.message}`)
      await clickByText(page, `${confirm.message}`)
    })

    it('', async () => {
      const txList = await transactionList(page)
      assert.equal(txList.length, 7)
      assert.equal(await transactionDetail(page, 'amount'), '-4 ETH')
    })

    it('', async () => {
      await dapp.bringToFront()
      await dapp.click('#withdrawButton')

      await page.bringToFront()
      await page.waitFor(500)

      const transactions = await page.$$('.transaction-list-item')
      await transactions[0].click()

      await clickByText(page, `${confirm.message}`)

      await page.waitForFunction(() => Number(document.querySelector('.currency-display-component.token-amount .currency-display-component__text').innerText) > 87)
      // await page.waitFor(10000)
    })

    xit('closes notification window', async () => {
      // const mainPageTitle = await page.title()
      // const dappTitle = await dapp.title()
      // const exceptions = [mainPageTitle, dappTitle]
      // await closeAllWindowHandlesExcept(driver, exceptions)
      const pages = await driver.pages()
      const notification = pages[pages.length - 1]
      await notification.close()
    })
  })

  describe('', () => {
    it('create token', async () => {
      await dapp.bringToFront()
      await clickByText(dapp, 'Create Token')

      const pages = await driver.pages()
      popup = pages[pages.length - 1]

      await popup.bringToFront()
      await popup.waitFor(500)

      const [gasPriceElement, gasLimitElement] = await popup.$$('.advanced-gas-inputs__gas-edit-row__input')

      const gasPrice = await gasPriceElement.evaluate(el => el.value)
      const gasLimit = await gasLimitElement.evaluate(el => el.value)

      assert.equal(gasPrice, '20')
      assert.equal(gasLimit, '4700000')

      await clickByText(popup, `${confirm.message}`)
    })

    it('closes notification window', async () => {
      // const mainPageTitle = await page.title()
      // const dappTitle = await dapp.title()
      // const exceptions = [mainPageTitle, dappTitle]
      // await closeAllWindowHandlesExcept(driver, exceptions)
      const pages = await driver.pages()
      const notification = pages[pages.length - 1]
      await notification.close()
    })

    it('gets token address', async () => {
      await dapp.bringToFront()
      await dapp.waitForFunction(() => document.querySelector('#tokenAddress').innerText.includes('0x'))
      tokenAddress = await dapp.$eval('#tokenAddress', el => el.innerText)
    })

    it('add token', async () => {
      await page.bringToFront()
      await clickByText(page, `${addToken.message}`, 1)
      await clickByText(page, `${customToken.message}`)

      await page.type('#custom-address', tokenAddress)

      await clickByText(page, `${next.message}`)
      await clickByText(page, `${addTokens.message}`, 1)
      await page.waitFor(10000)
    })

  })

  xdescribe('Add a custom token from a dapp', () => {
    it('clicks on the Add Token button', async () => {
      const addToken = await driver.findElement(By.xpath(`//div[contains(text(), 'Add Token')]`))
      await addToken.click()
      await delay(regularDelayMs)
    })

    it('picks the newly created Test token', async () => {
      const addCustomToken = await findElement(driver, By.xpath("//li[contains(text(), 'Custom Token')]"))
      await addCustomToken.click()
      await delay(regularDelayMs)

      const newTokenAddress = await findElement(driver, By.css('#custom-address'))
      await newTokenAddress.sendKeys(tokenAddress)
      await delay(regularDelayMs)

      const nextScreen = await findElement(driver, By.xpath(`//button[contains(text(), 'Next')]`))
      await nextScreen.click()
      await delay(regularDelayMs)

      const addTokens = await findElement(driver, By.xpath(`//button[contains(text(), 'Add Tokens')]`))
      await addTokens.click()
      await delay(regularDelayMs)
    })

    it('renders the balance for the new token', async () => {
      const balance = await findElement(driver, By.css('.transaction-view-balance .transaction-view-balance__primary-balance'))
      await driver.wait(until.elementTextMatches(balance, /^10.000\s*TST\s*$/))
      const tokenAmount = await balance.getText()
      assert.ok(/^10.000\s*TST\s*$/.test(tokenAmount))
      await delay(regularDelayMs)
    })
  })

  xdescribe('Send token from inside MetaMask', () => {
    let gasModal
    it('starts to send a transaction', async function () {
      const sendButton = await findElement(driver, By.xpath(`//button[contains(text(), 'Send')]`))
      await sendButton.click()
      await delay(regularDelayMs)

      const inputAddress = await findElement(driver, By.css('input[placeholder="Search, public address (0x), or ENS"]'))
      await inputAddress.sendKeys('0x2f318C334780961FB129D2a6c30D0763d9a5C970')

      const inputAmount = await findElement(driver, By.css('.unit-input__input'))
      await inputAmount.sendKeys('1')

      // Set the gas limit
      const configureGas = await findElement(driver, By.css('.advanced-gas-options-btn'))
      await configureGas.click()
      await delay(regularDelayMs)

      gasModal = await driver.findElement(By.css('span .modal'))
      await delay(regularDelayMs)
    })

    it('opens customize gas modal', async () => {
      await driver.wait(until.elementLocated(By.css('.page-container__title')))
      const save = await findElement(driver, By.xpath(`//button[contains(text(), 'Save')]`))
      await save.click()
      await delay(regularDelayMs)
    })

    it('transitions to the confirm screen', async () => {
      await driver.wait(until.stalenessOf(gasModal))

      // Continue to next screen
      const nextScreen = await findElement(driver, By.xpath(`//button[contains(text(), 'Next')]`))
      await nextScreen.click()
      await delay(regularDelayMs)
    })

    it('displays the token transfer data', async () => {
      const dataTab = await findElement(driver, By.xpath(`//li[contains(text(), 'Data')]`))
      dataTab.click()
      await delay(regularDelayMs)

      const functionType = await findElement(driver, By.css('.confirm-page-container-content__function-type'))
      const functionTypeText = await functionType.getText()
      assert.equal(functionTypeText, 'Transfer')

      const tokenAmount = await findElement(driver, By.css('.confirm-page-container-summary__title-text'))
      const tokenAmountText = await tokenAmount.getText()
      assert.equal(tokenAmountText, '1 TST')

      const confirmDataDiv = await findElement(driver, By.css('.confirm-page-container-content__data-box'))
      const confirmDataText = await confirmDataDiv.getText()

      await delay(regularDelayMs)
      assert(confirmDataText.match(/0xa9059cbb0000000000000000000000002f318c334780961fb129d2a6c30d0763d9a5c97/))

      const detailsTab = await findElement(driver, By.xpath(`//li[contains(text(), 'Details')]`))
      detailsTab.click()
      await delay(regularDelayMs)
    })

    it('submits the transaction', async function () {
      const confirmButton = await findElement(driver, By.xpath(`//button[contains(text(), 'Confirm')]`))
      await confirmButton.click()
      await delay(regularDelayMs)
    })

    it('finds the transaction in the transactions list', async function () {
      await driver.wait(async () => {
        const confirmedTxes = await findElements(driver, By.css('.transaction-list__completed-transactions .transaction-list-item'))
        return confirmedTxes.length === 1
      }, 10000)

      const txValues = await findElements(driver, By.css('.transaction-list-item__amount--primary'))
      assert.equal(txValues.length, 1)
      await driver.wait(until.elementTextMatches(txValues[0], /-1\s*TST/), 10000)

      const txStatuses = await findElements(driver, By.css('.transaction-list-item__action'))
      await driver.wait(until.elementTextMatches(txStatuses[0], /Sent\sToken/i), 10000)
    })
  })

  xdescribe('Send a custom token from dapp', () => {
    let gasModal
    it('sends an already created token', async () => {
      const windowHandles = await driver.getAllWindowHandles()
      const extension = windowHandles[0]
      const dapp = await switchToWindowWithTitle(driver, 'E2E Test Dapp', windowHandles)
      await delay(regularDelayMs)

      await driver.switchTo().window(dapp)
      await delay(tinyDelayMs)

      const transferTokens = await findElement(driver, By.xpath(`//button[contains(text(), 'Transfer Tokens')]`))
      await transferTokens.click()

      await driver.switchTo().window(extension)
      await delay(largeDelayMs)

      await findElements(driver, By.css('.transaction-list__pending-transactions'))
      const [txListValue] = await findElements(driver, By.css('.transaction-list-item__amount--primary'))
      await driver.wait(until.elementTextMatches(txListValue, /-1.5\s*TST/), 10000)
      await txListValue.click()
      await delay(regularDelayMs)

      const transactionAmounts = await findElements(driver, By.css('.currency-display-component__text'))
      const transactionAmount = transactionAmounts[0]
      assert(await transactionAmount.getText(), '1.5 TST')

      // Set the gas limit
      const configureGas = await driver.wait(until.elementLocated(By.css('.confirm-detail-row__header-text--edit')), 10000)
      await configureGas.click()
      await delay(regularDelayMs)

      gasModal = await driver.findElement(By.css('span .modal'))
    })

    it('customizes gas', async () => {
      const modalTabs = await findElements(driver, By.css('.page-container__tab'))
      await modalTabs[1].click()
      await delay(regularDelayMs)

      const [gasPriceInput, gasLimitInput] = await findElements(driver, By.css('.advanced-gas-inputs__gas-edit-row__input'))
      await gasPriceInput.sendKeys(Key.chord(Key.CONTROL, 'a'))
      await delay(50)

      await gasPriceInput.sendKeys(Key.BACK_SPACE)
      await delay(50)
      await gasPriceInput.sendKeys('10')
      await delay(50)
      await gasLimitInput.sendKeys(Key.chord(Key.CONTROL, 'a'))
      await delay(50)
      await gasLimitInput.sendKeys(Key.BACK_SPACE)
      await delay(50)
      await gasLimitInput.sendKeys('60000')

      await delay(1000)

      const save = await findElement(driver, By.css('.page-container__footer-button'))
      await save.click()
      await driver.wait(until.stalenessOf(gasModal))

      const gasFeeInputs = await findElements(driver, By.css('.confirm-detail-row__primary'))
      const renderedGasFee = await gasFeeInputs[0].getText()
      assert.equal(renderedGasFee, '0.0006')
    })

    it('submits the transaction', async function () {
      const tokenAmount = await findElement(driver, By.css('.confirm-page-container-summary__title-text'))
      const tokenAmountText = await tokenAmount.getText()
      assert.equal(tokenAmountText, '1.5 TST')

      const confirmButton = await findElement(driver, By.xpath(`//button[contains(text(), 'Confirm')]`))
      await confirmButton.click()
      await delay(regularDelayMs)
    })

    it('finds the transaction in the transactions list', async function () {
      await driver.wait(async () => {
        const confirmedTxes = await findElements(driver, By.css('.transaction-list__completed-transactions .transaction-list-item'))
        return confirmedTxes.length === 2
      }, 10000)

      const txValues = await findElements(driver, By.css('.transaction-list-item__amount--primary'))
      await driver.wait(until.elementTextMatches(txValues[0], /-1.5\s*TST/))
      const txStatuses = await findElements(driver, By.css('.transaction-list-item__action'))
      await driver.wait(until.elementTextMatches(txStatuses[0], /Sent\sToken/), 10000)

      const walletBalance = await findElement(driver, By.css('.wallet-balance'))
      await walletBalance.click()

      const tokenListItems = await findElements(driver, By.css('.token-list-item'))
      await tokenListItems[0].click()
      await delay(1000)

      const tokenBalanceAmount = await findElements(driver, By.css('.transaction-view-balance__primary-balance'))
      await driver.wait(until.elementTextMatches(tokenBalanceAmount[0], /7.500\s*TST/), 10000)
    })
  })

  xdescribe('Approves a custom token from dapp', () => {
    let gasModal
    it('approves an already created token', async () => {
      const windowHandles = await driver.getAllWindowHandles()
      const extension = windowHandles[0]
      const dapp = await switchToWindowWithTitle(driver, 'E2E Test Dapp', windowHandles)
      await closeAllWindowHandlesExcept(driver, [extension, dapp])
      await delay(regularDelayMs)

      await driver.switchTo().window(dapp)
      await delay(tinyDelayMs)

      const approveTokens = await findElement(driver, By.xpath(`//button[contains(text(), 'Approve Tokens')]`))
      await approveTokens.click()

      await driver.switchTo().window(extension)
      await delay(regularDelayMs)

      await driver.wait(async () => {
        const pendingTxes = await findElements(driver, By.css('.transaction-list__pending-transactions .transaction-list-item'))
        return pendingTxes.length === 1
      }, 10000)

      const [txListItem] = await findElements(driver, By.css('.transaction-list-item'))
      const [txListValue] = await findElements(driver, By.css('.transaction-list-item__amount--primary'))
      await driver.wait(until.elementTextMatches(txListValue, /-7\s*TST/))
      await txListItem.click()
      await delay(regularDelayMs)
    })

    it('displays the token approval data', async () => {
      const fullTxDataButton = await findElement(driver, By.css('.confirm-approve-content__view-full-tx-button'))
      await fullTxDataButton.click()
      await delay(regularDelayMs)

      const functionType = await findElement(driver, By.css('.confirm-approve-content__data .confirm-approve-content__small-text'))
      const functionTypeText = await functionType.getText()
      assert.equal(functionTypeText, 'Function: Approve')

      const confirmDataDiv = await findElement(driver, By.css('.confirm-approve-content__data__data-block'))
      const confirmDataText = await confirmDataDiv.getText()
      assert(confirmDataText.match(/0x095ea7b30000000000000000000000009bc5baf874d2da8d216ae9f137804184ee5afef4/))
    })

    it('opens the gas edit modal', async () => {
      const editButtons = await findElements(driver, By.css('.confirm-approve-content__small-blue-text.cursor-pointer'))
      await editButtons[0].click()
      await delay(regularDelayMs)

      gasModal = await driver.findElement(By.css('span .modal'))
    })

    it('customizes gas', async () => {
      const modalTabs = await findElements(driver, By.css('.page-container__tab'))
      await modalTabs[1].click()
      await delay(regularDelayMs)

      const [gasPriceInput, gasLimitInput] = await findElements(driver, By.css('.advanced-gas-inputs__gas-edit-row__input'))
      await gasPriceInput.sendKeys(Key.chord(Key.CONTROL, 'a'))
      await delay(50)

      await gasPriceInput.sendKeys(Key.BACK_SPACE)
      await delay(50)
      await gasPriceInput.sendKeys('10')
      await delay(50)
      await gasLimitInput.sendKeys(Key.chord(Key.CONTROL, 'a'))
      await delay(50)
      await gasLimitInput.sendKeys(Key.BACK_SPACE)
      await delay(50)
      await gasLimitInput.sendKeys('60001')

      await delay(1000)

      const save = await findElement(driver, By.css('.page-container__footer-button'))
      await save.click()
      await driver.wait(until.stalenessOf(gasModal))

      const gasFeeInEth = await findElement(driver, By.css('.confirm-approve-content__transaction-details-content__secondary-fee'))
      assert.equal(await gasFeeInEth.getText(), '0.0006 ETH')
    })

    it('edits the permission', async () => {
      const editButtons = await findElements(driver, By.css('.confirm-approve-content__small-blue-text.cursor-pointer'))
      await editButtons[1].click()
      await delay(regularDelayMs)

      const permissionModal = await driver.findElement(By.css('span .modal'))

      const radioButtons = await findElements(driver, By.css('.edit-approval-permission__edit-section__radio-button'))
      await radioButtons[1].click()

      const customInput = await findElement(driver, By.css('input'))
      await delay(50)
      await customInput.sendKeys('5')
      await delay(regularDelayMs)

      const saveButton = await findElement(driver, By.xpath(`//button[contains(text(), 'Save')]`))
      await saveButton.click()
      await delay(regularDelayMs)

      await driver.wait(until.stalenessOf(permissionModal))

      const permissionInfo = await findElements(driver, By.css('.confirm-approve-content__medium-text'))
      const amountDiv = permissionInfo[0]
      assert.equal(await amountDiv.getText(), '5 TST')
    })

    it('submits the transaction', async function () {
      const confirmButton = await findElement(driver, By.xpath(`//button[contains(text(), 'Confirm')]`))
      await confirmButton.click()
      await delay(regularDelayMs)
    })

    it('finds the transaction in the transactions list', async function () {
      await driver.wait(async () => {
        const confirmedTxes = await findElements(driver, By.css('.transaction-list__completed-transactions .transaction-list-item'))
        return confirmedTxes.length === 3
      }, 10000)

      const txValues = await findElements(driver, By.css('.transaction-list-item__amount--primary'))
      await driver.wait(until.elementTextMatches(txValues[0], /-5\s*TST/))
      const txStatuses = await findElements(driver, By.css('.transaction-list-item__action'))
      await driver.wait(until.elementTextMatches(txStatuses[0], /Approve/))
    })
  })

  xdescribe('Tranfers a custom token from dapp when no gas value is specified', () => {
    it('transfers an already created token, without specifying gas', async () => {
      const windowHandles = await driver.getAllWindowHandles()
      const extension = windowHandles[0]
      const dapp = await switchToWindowWithTitle(driver, 'E2E Test Dapp', windowHandles)
      await closeAllWindowHandlesExcept(driver, [extension, dapp])
      await delay(regularDelayMs)

      await driver.switchTo().window(dapp)

      const transferTokens = await findElement(driver, By.xpath(`//button[contains(text(), 'Transfer Tokens Without Gas')]`))
      await transferTokens.click()

      await driver.switchTo().window(extension)
      await delay(regularDelayMs)

      await driver.wait(async () => {
        const pendingTxes = await findElements(driver, By.css('.transaction-list__pending-transactions .transaction-list-item'))
        return pendingTxes.length === 1
      }, 10000)

      const [txListItem] = await findElements(driver, By.css('.transaction-list-item'))
      const [txListValue] = await findElements(driver, By.css('.transaction-list-item__amount--primary'))
      await driver.wait(until.elementTextMatches(txListValue, /-1.5\s*TST/))
      await txListItem.click()
      await delay(regularDelayMs)
    })

    it('submits the transaction', async function () {
      await delay(largeDelayMs * 2)
      const confirmButton = await findElement(driver, By.xpath(`//button[contains(text(), 'Confirm')]`))
      await confirmButton.click()
      await delay(largeDelayMs * 2)
    })

    it('finds the transaction in the transactions list', async function () {
      await driver.wait(async () => {
        const confirmedTxes = await findElements(driver, By.css('.transaction-list__completed-transactions .transaction-list-item'))
        return confirmedTxes.length === 4
      }, 10000)

      const txValues = await findElements(driver, By.css('.transaction-list-item__amount--primary'))
      await driver.wait(until.elementTextMatches(txValues[0], /-1.5\s*TST/))
      const txStatuses = await findElements(driver, By.css('.transaction-list-item__action'))
      await driver.wait(until.elementTextMatches(txStatuses[0], /Sent Tokens/))
    })
  })

  xdescribe('Approves a custom token from dapp when no gas value is specified', () => {
    it('approves an already created token', async () => {
      const windowHandles = await driver.getAllWindowHandles()
      const extension = windowHandles[0]
      const dapp = await switchToWindowWithTitle(driver, 'E2E Test Dapp', windowHandles)
      await closeAllWindowHandlesExcept(driver, [extension, dapp])
      await delay(regularDelayMs)

      await driver.switchTo().window(dapp)
      await delay(tinyDelayMs)

      const transferTokens = await findElement(driver, By.xpath(`//button[contains(text(), 'Approve Tokens Without Gas')]`))
      await transferTokens.click()

      await driver.switchTo().window(extension)
      await delay(regularDelayMs)

      await driver.wait(async () => {
        const pendingTxes = await findElements(driver, By.css('.transaction-list__pending-transactions .transaction-list-item'))
        return pendingTxes.length === 1
      }, 10000)

      const [txListItem] = await findElements(driver, By.css('.transaction-list-item'))
      const [txListValue] = await findElements(driver, By.css('.transaction-list-item__amount--primary'))
      await driver.wait(until.elementTextMatches(txListValue, /-7\s*TST/))
      await txListItem.click()
      await delay(regularDelayMs)
    })

    it('shows the correct recipient', async function () {
      const fullTxDataButton = await findElement(driver, By.css('.confirm-approve-content__view-full-tx-button'))
      await fullTxDataButton.click()
      await delay(regularDelayMs)

      const permissionInfo = await findElements(driver, By.css('.confirm-approve-content__medium-text'))
      const recipientDiv = permissionInfo[1]
      assert.equal(await recipientDiv.getText(), '0x2f318C33...C970')
    })

    it('submits the transaction', async function () {
      await delay(1000)
      const confirmButton = await findElement(driver, By.xpath(`//button[contains(text(), 'Confirm')]`))
      await confirmButton.click()
      await delay(regularDelayMs)
    })

    it('finds the transaction in the transactions list', async function () {
      await driver.wait(async () => {
        const confirmedTxes = await findElements(driver, By.css('.transaction-list__completed-transactions .transaction-list-item'))
        return confirmedTxes.length === 5
      }, 10000)

      const txValues = await findElements(driver, By.css('.transaction-list-item__amount--primary'))
      await driver.wait(until.elementTextMatches(txValues[0], /-7\s*TST/))
      const txStatuses = await findElements(driver, By.css('.transaction-list-item__action'))
      await driver.wait(until.elementTextMatches(txStatuses[0], /Approve/))
    })
  })

  xdescribe('Hide token', () => {
    it('hides the token when clicked', async () => {
      const [hideTokenEllipsis] = await findElements(driver, By.css('.token-list-item__ellipsis'))
      await hideTokenEllipsis.click()

      const byTokenMenuDropdownOption = By.css('.menu__item--clickable')
      const tokenMenuDropdownOption = await driver.wait(until.elementLocated(byTokenMenuDropdownOption))

      await tokenMenuDropdownOption.click()

      const confirmHideModal = await findElement(driver, By.css('span .modal'))

      const byHideTokenConfirmationButton = By.css('.hide-token-confirmation__button')
      const hideTokenConfirmationButton = await driver.wait(until.elementLocated(byHideTokenConfirmationButton))
      await hideTokenConfirmationButton.click()

      await driver.wait(until.stalenessOf(confirmHideModal))
    })
  })

  xdescribe('Add existing token using search', () => {
    it('clicks on the Add Token button', async () => {
      const addToken = await findElement(driver, By.xpath(`//div[contains(text(), 'Add Token')]`))
      await addToken.click()
      await delay(regularDelayMs)
    })

    it('can pick a token from the existing options', async () => {
      const tokenSearch = await findElement(driver, By.css('#search-tokens'))
      await tokenSearch.sendKeys('BAT')
      await delay(regularDelayMs)

      const token = await findElement(driver, By.xpath("//span[contains(text(), 'BAT')]"))
      await token.click()
      await delay(regularDelayMs)

      const nextScreen = await findElement(driver, By.xpath(`//button[contains(text(), 'Next')]`))
      await nextScreen.click()
      await delay(regularDelayMs)

      const addTokens = await findElement(driver, By.xpath(`//button[contains(text(), 'Add Tokens')]`))
      await addTokens.click()
      await delay(largeDelayMs)
    })

    it('renders the balance for the chosen token', async () => {
      const balance = await findElement(driver, By.css('.transaction-view-balance__primary-balance'))
      await driver.wait(until.elementTextMatches(balance, /0\s*BAT/))
      await delay(regularDelayMs)
    })
  })

  xdescribe('Stores custom RPC history', () => {
    const customRpcUrls = [
      'http://127.0.0.1:8545/1',
      'http://127.0.0.1:8545/2',
      'http://127.0.0.1:8545/3',
      'http://127.0.0.1:8545/4',
    ]

    customRpcUrls.forEach(customRpcUrl => {
      it(`creates custom RPC: ${customRpcUrl}`, async () => {
        const networkDropdown = await findElement(driver, By.css('.network-name'))
        await networkDropdown.click()
        await delay(regularDelayMs)

        const customRpcButton = await findElement(driver, By.xpath(`//span[contains(text(), 'Custom RPC')]`))
        await customRpcButton.click()
        await delay(regularDelayMs)

        await findElement(driver, By.css('.settings-page__sub-header-text'))

        const customRpcInputs = await findElements(driver, By.css('input[type="text"]'))
        const customRpcInput = customRpcInputs[1]
        await customRpcInput.clear()
        await customRpcInput.sendKeys(customRpcUrl)

        const customRpcSave = await findElement(driver, By.css('.network-form__footer .btn-secondary'))
        await customRpcSave.click()
        await delay(largeDelayMs * 2)
      })
    })

    it('selects another provider', async () => {
      const networkDropdown = await findElement(driver, By.css('.network-name'))
      await networkDropdown.click()
      await delay(regularDelayMs)

      const customRpcButton = await findElement(driver, By.xpath(`//span[contains(text(), 'Main Ethereum Network')]`))
      await customRpcButton.click()
      await delay(largeDelayMs * 2)
    })

    it('finds all recent RPCs in history', async () => {
      const networkDropdown = await findElement(driver, By.css('.network-name'))
      await networkDropdown.click()
      await delay(regularDelayMs)

      // only recent 3 are found and in correct order (most recent at the top)
      const customRpcs = await findElements(driver, By.xpath(`//span[contains(text(), 'http://127.0.0.1:8545/')]`))

      assert.equal(customRpcs.length, customRpcUrls.length)
    })

    it('deletes a custom RPC', async () => {
      const networkListItems = await findElements(driver, By.css('.networks-tab__networks-list-name'))
      const lastNetworkListItem = networkListItems[networkListItems.length - 1]
      await lastNetworkListItem.click()
      await delay(100)

      const deleteButton = await findElement(driver, By.css('.btn-danger'))
      await deleteButton.click()
      await delay(regularDelayMs)

      const confirmDeleteNetworkModal = await findElement(driver, By.css('span .modal'))

      const byConfirmDeleteNetworkButton = By.css('.button.btn-danger.modal-container__footer-button')
      const confirmDeleteNetworkButton = await driver.wait(until.elementLocated(byConfirmDeleteNetworkButton))
      await confirmDeleteNetworkButton.click()

      await driver.wait(until.stalenessOf(confirmDeleteNetworkModal))

      const newNetworkListItems = await findElements(driver, By.css('.networks-tab__networks-list-name'))

      assert.equal(networkListItems.length - 1, newNetworkListItems.length)
    })
  })
})
