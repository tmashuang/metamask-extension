export async function accountDetails (page) {

  await page.waitFor('.main-container-wrapper')
  await page.click('.menu-bar__account-options')
  const [accountDetails] = await page.$$('.menu-item')
  await accountDetails.click()

  const publicAddress = await page.$eval('.qr-ellip-address', (el) => el.value)
  await page.waitFor('.qr-wrapper')
  await page.evaluate(() => document.querySelector('.account-modal-close').click())
  await page.waitFor(500)
  return publicAddress
}
