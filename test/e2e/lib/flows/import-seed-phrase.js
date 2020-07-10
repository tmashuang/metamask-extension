import { lock } from '../view/lock-unlock'

const testSeedPhrase = 'phrase upgrade clock rough situate wedding elder clever doctor stamp excess tent'
const defaultPassword = 'correct horse battery staple'

export async function importSeedPhrase (page, seedPhrase = testSeedPhrase, password = defaultPassword) {
  await lock(page)

  await page.waitFor('.unlock-page')
  await page.click('.unlock-page__link--import')

  await page.waitFor('.import-account')
  await page.type('.import-account__secret-phrase', seedPhrase)

  await page.type('input#password', password)
  await page.type('input#confirm-password', password)

  await page.click('.button.first-time-flow__button')
}
