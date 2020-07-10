export async function textChecker (page, selector, expectedText, index = 0) {
  await page.waitFor(selector)
  await page.waitForFunction(
    `document.querySelectorAll('${selector}')[${index}].textContent.includes('${expectedText}')`
  )
}

export async function clickByText (page, text, index = 0) {
  await page.waitFor(500)

  const xpath = `//*[contains(text(), '${text}')]`
  const elements = await page.$x(xpath)

  await elements[index].click()
  await page.waitFor(500)
}

export async function clearInput (page) {
  await page.keyboard.down('Control')
  await page.keyboard.press('KeyA')
  await page.keyboard.up('Control')
  await page.keyboard.press('Backspace')
}
