async function lock (page) {
  await page.waitFor('.account-menu__icon')
  await page.click('.account-menu__icon')
  await page.waitFor('.menu.account-menu')
  await page.click('.account-menu__lock-button')
  await page.waitFor('.unlock-page')
}

async function unlock (page, password) {
  await page.waitFor('.unlock-page')
  await page.type('.unlock-page__form input#password', password)
  await page.keyboard.press('Enter')
  await page.waitFor(500)
}

module.exports = {
  lock,
  unlock,
}

