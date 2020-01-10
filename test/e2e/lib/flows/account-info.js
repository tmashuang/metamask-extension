export default async function accountInfo (page) {

  await page.waitFor('.account-and-transaction-details')
  const [accountDetails] = await page.$$('.account-details__details-button')
  await accountDetails.click()

  const publicAddress = await page.$eval('.qr-ellip-address', el => el.value)
  await page.waitFor('.qr-wrapper')
  await page.evaluate(() => document.querySelector('.account-modal-close').click())
  await page.waitFor(500)
  return publicAddress
}
