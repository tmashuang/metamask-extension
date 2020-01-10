module.exports = {
  clickLogo,
  openAccountMenu,
  accountOptions,
  clickSend,
  clickDeposit,
  clickSidebar,
  checkAccountName,
  networkSelector,
  transactionDetail,
  transactionList,
}

async function clickLogo (page) {
  await page.waitFor('.app-header')
  await page.click('.app-header__logo-container')
}

async function accountOptions (page) {

  await page.waitFor('.account-and-transaction-details')

  const accountOptions = '.menu-bar__open-in-browser'
  await accountOptions.click()

  await page.waitFor('.menu.account-details-dropdown')
}

async function clickSend (page) {
  await page.waitFor('.account-and-transaction-details')

  const send = `//button[contains(text(), 'Send')]`
  const sendButton = await page.$x(send)
  await sendButton[0].click()
}

async function clickDeposit (page) {
  await page.waitFor('.account-and-transaction-details')

  const deposit = `//button[contains(text(), 'Deposit')]`
  const depositButton = await page.$x(deposit)
  await depositButton[0].click()
}

async function clickSidebar (page) {
  await page.waitFor('.account-and-transaction-details')

  const sidebarButton = '.menu-bar__sidebar-button'
  await page.waitFor(sidebarButton)
  await page.click(sidebarButton)

  await page.waitFor('.wallet-view.sidebar-right')
}

async function checkAccountName (page) {
  await page.waitFor('.account-and-transaction-details')

  const accountNameSelector = '.account-details__account-name'
  const accountNameElement = await page.$(accountNameSelector)

  const accountName = await page.evaluate(el => el.innerText, accountNameElement)
  return accountName
}

async function networkSelector (page) {
  await page.waitFor('.app-header')

  const networkSelector = '.network-component'
  await page.click(networkSelector)

  await page.waitFor('.menu-droppo-container.network-droppo')
}

async function openAccountMenu (page) {
  await page.waitFor('.app-header')

  const accountMenu = '.account-menu__icon'
  await page.click(accountMenu)

  await page.waitFor('.menu.account-menu')
}

async function transactionList (page) {

  await page.waitFor('.account-and-transaction-details')
  const transationList = await page.$$('.transaction-list-item')
  return transationList

}

async function transactionDetail (page, detail, txNumber = 0) {

  await page.waitFor(1000)

  let txDetail, txDetailValue, transactions

  switch (detail) {

    case 'action':
    case 'status':
      txDetail = `.transaction-list-item__${detail}`
      txDetailValue = await page.$$eval(txDetail, _ => _.map(el => el.innerText))
      return txDetailValue[txNumber]

    case 'nonce':
    case 'amount':
      txDetail = `.transaction-list-item__${detail}`
      txDetailValue = await page.$$eval(txDetail, _ => _.map(el => el.title))
      return txDetailValue[txNumber]

    case 'gasPrice':
      transactions = await page.$$('.transaction-list-item')
      await transactions[txNumber].click()

      await page.waitFor('.transaction-list-item__expander--show')

      txDetail = await page.$$('.transaction-breakdown-row__value')
      txDetailValue = txDetail[3].evaluate(element => element.innerText)
      return txDetailValue

    case 'gasLimit':
      transactions = await page.$$('.transaction-list-item')
      await transactions[txNumber].click()

      await page.waitFor('.transaction-list-item__expander--show')

      txDetail = await page.$$('.transaction-breakdown-row__value')
      txDetailValue = txDetail[1].evaluate(element => element.innerText)
      return txDetailValue
    default:
      throw new Error(`Select a transaction detail`)
  }

}
