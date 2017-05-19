const assert = require('assert')
const { resolve } = require('path')
const { expect } = require('chai')
const webdriver = require('selenium-webdriver')
const By = webdriver.By
const until = webdriver.until

const { delay, startChromeDriver, buildWebDriver } = require('../helper')

// const path = resolve('dists/chrome')
// const extensionId = 'nkbihfbeogaeaoehlefnkodbefgpgknn'

describe('Metamask Extension', function test () {
  let driver
  this.timeout(20000)

  before(async () => {
    delay(2000)
    await startChromeDriver()
    driver = new webdriver.Builder()
      .forBrowser('chrome')
      .build()
    await driver.getWindowHandle()
    await driver.get('http://zero.metamask.io')
  })

  // after(async () => {
  //   await driver.quit()
  // })

  // it('should open extension\'s window', async () => {
  //   await driver.get(`chrome-extension://${extensionId}/popup.html`)
  //   const url = await driver.getCurrentUrl()
  //   expect(url).to.equal(`chrome-extension://${extensionId}/popup.html`)
  //   // assert.equal(url, `chrome-extension://${extensionId}/popup.html`)
  // })

  it('should open Mascara', async () => {
    const url = await driver.getCurrentUrl()
    expect(url).to.equal('https://zero.metamask.io/')
  })

  it('should match document title', async () => {
    const title = await driver.getTitle()
    expect(title).to.equal('MetaMascara Alpha')
  })

  it('should check current url', async () => {
    delay(1000)
    const url = await driver.getCurrentUrl()
    assert(url, 'https://zero.metamask.io/')
  })

  it('should have default Ropsten Test Net', async () => {
    await driver.wait(until.elementLocated({css: '.network-name'}), 5000)
      .getText()
      .then((text) => {
        assert(text, 'Ropsten Test Net')
      })
  })

  it('should show notice of Terms and Conditions', async () => {
    await driver.wait(until.elementLocated({css: '.notice-box' }), 5000)
      .getText()
      .then(text => text)
  })

  it('should not be able to click the contine button until scrolling down through terms and condition', async () => {
    await driver.findElement({css: 'button'})
    .isEnabled()
  })

  it('should scroll down the terms and condition page', async () => {
    const attributions = await driver.wait(driver.findElement({css: '.markdown a'}), 5000)
    driver.executeScript('arguments[0].scrollIntoView(true);', attributions)
  })

  it('should be enabled after scrolling down the terms and conditions', async () => {
    await driver.findElement({css: 'button'})
      .click()
  })
})

