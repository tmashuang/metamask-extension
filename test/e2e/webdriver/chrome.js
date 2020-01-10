const { Builder } = require('selenium-webdriver')
const puppeteer = require('puppeteer')
// import puppeteer from 'puppeteer'
const chrome = require('selenium-webdriver/chrome')

/**
 * A wrapper around a {@code WebDriver} instance exposing Chrome-specific functionality
 */
class ChromeDriver {
  static async build ({ extensionPath, responsive }) {
    const args = [
      `--disable-extensions-except=${extensionPath}`,
      `load-extension=${extensionPath}`,
    ]
    if (responsive) {
      args.push('--auto-open-devtools-for-tabs')
    }

    const driver = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args,
    })
    const chromeDriver = new ChromeDriver(driver)
    const extensionId = await chromeDriver.getExtensionId()

    return {
      driver,
      extensionUrl: `chrome-extension://${extensionId}/home.html`,
    }
  }

  /**
   * @constructor
   * @param {!ThenableWebDriver} driver a {@code WebDriver} instance
   */
  constructor (driver) {
    this._driver = driver
  }

  /**
   * Returns the extension ID for the given extension name
   * @param {string} extensionName the extension name
   * @return {Promise<string|undefined>} the extension ID
   */
  async getExtensionId () {
    const targets = await this._driver.targets()
    const backgroundPageTarget = await targets.find(target => target.type() === 'background_page')
    const url = await backgroundPageTarget.url()
    const extensionId = url.split('/')[2]
    return extensionId
  }
}

module.exports = ChromeDriver
