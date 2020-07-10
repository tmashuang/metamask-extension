const { Builder } = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const puppeteer = require('puppeteer')

/**
 * A wrapper around a {@code WebDriver} instance exposing Chrome-specific functionality
 */
class ChromeDriver {
  // static async build ({ extensionPath, responsive, port }) {
  //   const args = [
  //     `load-extension=${extensionPath}`,
  //   ]
  //   if (responsive) {
  //     args.push('--auto-open-devtools-for-tabs')
  //   }
  //   const options = new chrome.Options()
  //     .addArguments(args)
  //   const builder = new Builder()
  //     .forBrowser('chrome')
  //     .setChromeOptions(options)
  //   if (port) {
  //     const service = new chrome.ServiceBuilder()
  //       .setPort(port)
  //     builder.setChromeService(service)
  //   }
  //   const driver = builder.build()
  //   const chromeDriver = new ChromeDriver(driver)
  //   const extensionId = await chromeDriver.getExtensionIdByName('MetaMask')

  //   return {
  //     driver,
  //     extensionUrl: `chrome-extension://${extensionId}`,
  //   }
  // }

  static async build ({ extensionPath, slowMo = false }) {
    const args = [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ]

    const browser = await puppeteer.launch({
      headless: false,
      args,
      defaultViewport: null,
      ...(slowMo && { slowMo }),
    })

    const driver = new ChromeDriver(browser)

    const { extensionPage, extensionId, extensionUrl } = await driver.navigate(browser)

    return {
      driver: browser,
      extensionPage,
      extensionId,
      extensionUrl,
    }

  }

  /**
   * @constructor
   * @param {!ThenableWebDriver} driver - a {@code WebDriver} instance
   */
  constructor (driver) {
    this._driver = driver
  }

  /**
   * Returns the extension ID for the given extension name
   * @param {string} extensionName - the extension name
   * @returns {Promise<string|undefined>} - the extension ID
   */
  async navigate (browser) {
    const targets = await browser.targets()

    const extensionTarget = targets.find(({ _targetInfo }) => {
      return _targetInfo.title === 'MetaMask'
    })

    const partialExtensionUrl = extensionTarget._targetInfo.url || ''
    const [, , extensionId] = partialExtensionUrl.split('/')
    const extensionHomeHtml = 'home.html'

    const extensionPage = await browser.newPage()
    await extensionPage.waitFor(2000)

    const extensionUrl = `chrome-extension://${extensionId}/${extensionHomeHtml}`
    await extensionPage.goto(extensionUrl)

    const firstBlankTab = (await browser.pages())[0]
    // const installAutoTab = (await browser.pages())[2]

    await firstBlankTab.close()
    // await installAutoTab.close()

    return {
      extensionPage,
      extensionId,
      extensionUrl,
    }

  }
}

module.exports = ChromeDriver
