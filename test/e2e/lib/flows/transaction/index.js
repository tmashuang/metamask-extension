import {
  clearInput,
  clickByText,
} from '../../helpers'

import {
  activity,
} from '../../../../../app/_locales/en/messages.json'

export async function confirmTx (page) {
  await page.waitFor('.confirm-page-container-content')
  const confirm = `//button[contains(text(), 'Confirm')]`
  const confirmButton = await page.$x(confirm)
  await confirmButton[0].click()
}

export async function editBasicGasFromConfirm (page, gasOption) {
  await page.waitFor('.confirm-page-container-content')
  await page.click('.confirm-detail-row__header-text--edit')
  await selectGasPriceCard(page, gasOption)
  await page.click('.button.page-container__footer-button')
}

export async function editAdvancedGasFromConfirm (page, gasPrice, gasLimit) {
  await page.waitFor('.confirm-page-container-content')
  await page.click('.confirm-detail-row__header-text--edit')

  const advancedxPath = `//li[contains(text(), 'Advanced')]`
  const advancedTab = await page.$x(advancedxPath)
  advancedTab[0].click()

  await advancedGasInput(page, gasPrice, gasLimit)
  await page.click('.button.page-container__footer-button')
}

export async function selectGasPriceCard (page, gasOption) {
  await page.waitFor('[class^="gas-price-button-group"]')
  switch (gasOption) {
    case 'Slow':
    case 'Average':
    case 'Fast':
      const gas = `//button/div/div[contains(text(), '${gasOption}')]`
      const gasTab = await page.$x(gas)
      await gasTab[0].click()
      break
    default:
      throw new Error(`Select gas options 'Slow', 'Average', 'Fast'`)
  }
}

export async function editGasPrice (page, value) {
  await page.waitFor('.advanced-gas-inputs__gas-edit-row__input')
  const [gasPriceInput] = await page.$$('.advanced-gas-inputs__gas-edit-row__input')
  await gasPriceInput.focus()
  await clearInput(page)
  await page.keyboard.type(value)
  await page.waitFor(500)
}

export async function editGasLimit (page, value) {
  await page.waitFor('.advanced-gas-inputs__gas-edit-row__input')
  const [_, gasLimitInput] = await page.$$('.advanced-gas-inputs__gas-edit-row__input') // eslint-disable-line
  await gasLimitInput.focus()
  await clearInput(page)
  await page.keyboard.type(value)
  await page.waitFor(500)
}


export async function advancedGasInput (page, gasPrice, gasLimit) {
  await page.waitFor('.advanced-gas-inputs__gas-edit-rows')

  if (gasPrice) {
    await editGasPrice(page, gasPrice)
  }

  if (gasLimit) {
    // await gasLimitInput.type(gasLimit)
    await editGasLimit(page, gasLimit)
  }

}

export async function setAmountTx (page, { amount, maxMode = false }) {
  await page.waitFor('.unit-input')

  if (maxMode) {
    await page.click('.send-v2__amount-max__button')
  } else {
    await page.type('.unit-input__input', amount)
  }
}

export async function selectAsset (page, asset) {
  await page.click('.send-v2__asset-dropdown__asset')
  await page.waitFor('.send-v2__asset-dropdown__list')

  const assetxPath = `//div[contains(text(), ${asset})]`
  const assetElement = await page.$x(assetxPath)

  assetElement[0].click()
}


export async function transactionList (page) {
  await page.waitFor('.home__main-view')
  await clickByText(page, activity.message)

  await page.waitFor('.transaction-list')
  const transationList = await page.$$('.transaction-list-item')
  return transationList

}