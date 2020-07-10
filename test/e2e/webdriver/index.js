const { Browser } = require('selenium-webdriver')
// const Driver = require('./driver')
// const ChromeDriver = require('./chrome')
const ChromeDriver = require('./puppeteer-wip')
const FirefoxDriver = require('./firefox')
const fetchMockResponses = require('../../data/fetch-mocks.json')

async function buildWebDriver ({ responsive, port } = {}) {
  const browser = process.env.BROWSER
  const extensionPath = `dist/${browser}`
  const slowMo = 25

  const {
    driver,
    extensionPage,
    extensionId,
    extensionUrl,
  } = await buildBrowserWebDriver(browser, { extensionPath, responsive, port, slowMo })
  // const driver = new Driver(puppeteerDriver, browser, extensionUrl)
  // await driver.navigate()
  await setupFetchMocking(extensionPage)

  // await driver.delay(1000)

  return {
    driver,
    extensionPage,
    extensionId,
    extensionUrl,
  }
}

async function buildBrowserWebDriver (browser, webDriverOptions) {
  switch (browser) {
    case Browser.CHROME: {
      return await ChromeDriver.build(webDriverOptions)
    }
    case Browser.FIREFOX: {
      return await FirefoxDriver.build(webDriverOptions)
    }
    default: {
      throw new Error(`Unrecognized browser: ${browser}`)
    }
  }
}

async function setupFetchMocking (driver) {
  // define fetchMocking script, to be evaluated in the browser
  function fetchMocking (fetchMockResponses) {
    window.origFetch = window.fetch.bind(window)
    window.fetch = async (...args) => {
      const url = args[0]
      if (url === 'https://ethgasstation.info/json/ethgasAPI.json') {
        return { json: async () => clone(fetchMockResponses.ethGasBasic) }
      } else if (url === 'https://ethgasstation.info/json/predictTable.json') {
        return { json: async () => clone(fetchMockResponses.ethGasPredictTable) }
      } else if (url.match(/chromeextensionmm/)) {
        return { json: async () => clone(fetchMockResponses.metametrics) }
      }
      return window.origFetch(...args)
    }
    if (window.chrome && window.chrome.webRequest) {
      window.chrome.webRequest.onBeforeRequest.addListener(cancelInfuraRequest, { urls: ['https://*.infura.io/*'] }, ['blocking'])
    }
    function cancelInfuraRequest (requestDetails) {
      console.log(`fetchMocking - Canceling request: "${requestDetails.url}"`)
      return { cancel: true }
    }
    function clone (obj) {
      return JSON.parse(JSON.stringify(obj))
    }
  }
  // fetchMockResponses are parsed last minute to ensure that objects are uniquely instantiated
  const fetchMockResponsesJson = JSON.stringify(fetchMockResponses)
  // eval the fetchMocking script in the browser
  await driver.evaluate(`(${fetchMocking})(${fetchMockResponsesJson})`)
}

module.exports = {
  buildWebDriver,
}
