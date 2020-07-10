export async function accountMenu (page) {
  await page.waitFor('.app-header__account-menu-container')
  await page.click('.account-menu__icon')
  await page.waitFor('.menu.account-menu')
}

export async function createAccount (page) {
  await accountMenu(page)
  const [createAccount] = await page.$$('.menu__item.menu__item--clickable')
  await createAccount.click()
}

export async function importAccount (page) {
  await accountMenu(page)
  const [, importAccount] = await page.$$('.menu__item.menu__item--clickable')
  await importAccount.click()
}

export async function infoAndHelp (page) {
  await accountMenu(page)
  const [,, infoAndHelp] = await page.$$('.menu__item.menu__item--clickable')
  await infoAndHelp.click()
}

export async function settings (page) {
  await accountMenu(page)
  const [,,, settings] = await page.$$('.menu__item.menu__item--clickable')
  await settings.click()
}


