import assert from 'assert'

module.exports = {
  amountChecker,
  balanceChecker,
  clickByText,
  clearInput,
  navigateTx,
}

async function clickByText (page, text, index = 0) {
  await page.waitFor(500)

  const xpath = `//*[contains(text(), '${text}')]`
  const elements = await page.$x(xpath)
  const element = elements[index]

  await element.click()
  await page.waitFor(500)
}

async function clearInput (page) {
  await page.keyboard.down('Control')
  await page.keyboard.press('KeyA')
  await page.keyboard.up('Control')
  await page.keyboard.press('Backspace')
}

async function balanceChecker (page, selector) {
  await page.waitFor('.wallet-balance')
  const balance = await page.$eval(selector, el => {
    return el.title // Have to use title here for balance in token amount
  })
  await page.waitFor(500)
  return balance
}

async function amountChecker (pageElement, expectedAmountText) {
  const amount = await pageElement.evaluate(el => el.innerText)
  assert.equal(expectedAmountText, amount)
}

async function navigateTx (page, index) {
  await page.waitFor('.confirm-page-container-navigation')
  const navigationButton = await page.$$('.confirm-page-container-navigation__arrow')

  if (index !== undefined) {
    await navigationButton[index].click()
  }

  const navigationElement = await page.$('.confirm-page-container-navigation')
  const navigationText = await navigationElement.evaluate(el => el.innerText)
  return navigationText
}
