export async function transactionDetail (page, detail, txNumber = 0) {

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
      txDetailValue = txDetail[1].evaluate((element) => element.innerText)
      return txDetailValue
    default:
      throw new Error(`Select a transaction detail`)
  }

}

export async function goHome (page) {
  const logoSelector = '.app-header__logo-container'
  await page.waitFor(logoSelector)
  await page.click(logoSelector)
}