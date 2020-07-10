import assert from 'assert'
import {
  confirmTx,
  selectGasPriceCard,
  setAmountTx,
  advancedGasInput,
} from './index'

import {
  clickByText,
} from '../../helpers'

import {
  advancedOptions,
  save,
  next,
} from '../../../../../app/_locales/en/messages.json'

export async function sendTx (page, opts = {}) {
  let contactName
  await page.waitFor('.wallet-overview__buttons')

  const send = `//button[contains(text(), 'Send')]`
  const sendButton = await page.$x(send)
  await sendButton[0].click()

  const sendTo = '.ens-input.send__to-row'
  await page.waitFor(sendTo)


  if (opts.addressBook === true) {

    await page.waitFor('.send__select-recipient-wrapper__group-item__title')
    const contact = `.send__select-recipient-wrapper__group-item__content`
    const name = await page.evaluate((el) => el.innerText, contact)
    assert.equal(name, contactName)

    await page.click('.send__select-recipient-wrapper__group-item')

  } else {

    await page.type(sendTo, opts.address)

  }

  await page.waitFor('.send-v2__form')

  if (opts.addToaddressBook === true) {

    contactName = 'Test Name 1'

    await page.waitFor('.send__dialog.dialog--message')
    await page.click('.send__dialog.dialog--message')

    await page.waitFor('.add-to-address-book-modal')

    await page.type('.add-to-address-book-modal__input', contactName)

    const save = `//button[contains(text(), 'Save')]`
    const saveButton = await page.$x(save)
    saveButton[0].click()

    await page.waitFor('.ens-input__selected-input__subtitle')

    const ensTitle = await page.$('.ens-input__selected-input__title')
    const name = await page.evaluate(el => el.innerText, ensTitle)

    assert.equal(name, contactName, 'Send Screen Address Contact Save')

  }

  const sendOptions = { amount: '1' }
  await setAmountTx(page, sendOptions)

  if (opts.gasOption) {
    switch (opts.gasOption) {
      case 'Advanced':
        await clickByText(page, advancedOptions.message)
        await advancedGasInput(page, opts.gasPrice, opts.gasLimit)
        await clickByText(page, save.message)
        break

      default:
        await selectGasPriceCard(page, opts.gasOption)
        break
    }
  }

  await clickByText(page, next.message)

  await confirmTx(page)

}
