import { createAccount } from '../view/account-menu'

export async function createsAccount (page, accountName) {
  await createAccount(page)

  await page.waitFor('.new-account-create-form')

  if (accountName) {
    await page.type('.new-account-create-form__input', accountName)
  }

  await page.click('.btn-secondary.new-account-create-form__button')
  await page.waitFor('.home__container')
}
