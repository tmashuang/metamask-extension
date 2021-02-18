const assert = require('assert');
const { By, until } = require('selenium-webdriver');

const enLocaleMessages = require('../../app/_locales/en/messages.json');
const { tinyDelayMs, regularDelayMs, largeDelayMs } = require('./helpers');
const { buildWebDriver } = require('./webdriver');
const Ganache = require('./ganache');

const ganacheServer = new Ganache();

describe('MetaMask', function () {
  let driver;

  const testSeedPhrase =
    'forum vessel pink push lonely enact gentle tail admit parrot grunt dress';

  this.timeout(0);
  this.bail(true);

  before(async function () {
    await ganacheServer.start({
      accounts: [
        {
          secretKey:
            '0x53CB0AB5226EEBF4D872113D98332C1555DC304443BEE1CF759D15798D3C55A9',
          balance: 25000000000000000000,
        },
      ],
    });
    const result = await buildWebDriver();
    driver = result.driver;
    await driver.navigate();
  });

  afterEach(async function () {
    if (process.env.SELENIUM_BROWSER === 'chrome') {
      const errors = await driver.checkBrowserForConsoleErrors();
      if (errors.length) {
        const errorReports = errors.map((err) => err.message);
        const errorMessage = `Errors found in browser console:\n${errorReports.join(
          '\n',
        )}`;
        console.error(new Error(errorMessage));
      }
    }
    if (this.currentTest.state === 'failed') {
      await driver.verboseReportOnFailure(this.currentTest.title);
    }
  });

  after(async function () {
    await ganacheServer.quit();
    await driver.quit();
  });

  describe('Going through the first time flow', function () {
    it('clicks the continue button on the welcome screen', async function () {
      await driver.findElement(By.css('.welcome-page__header'));
      await driver.clickElement(
        By.xpath(
          `//button[contains(text(), '${enLocaleMessages.getStarted.message}')]`,
        ),
      );
      await driver.delay(largeDelayMs);
    });

    it('clicks the "Create New Wallet" option', async function () {
      await driver.clickElement(
        By.xpath(`//button[contains(text(), 'Create a Wallet')]`),
      );
      await driver.delay(largeDelayMs);
    });

    it('clicks the "No thanks" option on the metametrics opt-in screen', async function () {
      await driver.clickElement(By.css('.btn-default'));
      await driver.delay(largeDelayMs);
    });

    it('accepts a secure password', async function () {
      const passwordBox = await driver.findElement(
        By.css('.first-time-flow__form #create-password'),
      );
      const passwordBoxConfirm = await driver.findElement(
        By.css('.first-time-flow__form #confirm-password'),
      );

      await passwordBox.sendKeys('correct horse battery staple');
      await passwordBoxConfirm.sendKeys('correct horse battery staple');

      await driver.clickElement(By.css('.first-time-flow__checkbox'));
      await driver.clickElement(By.css('.first-time-flow__form button'));
      await driver.delay(regularDelayMs);
    });

    let seedPhrase;

    it('reveals the seed phrase', async function () {
      const byRevealButton = By.css(
        '.reveal-seed-phrase__secret-blocker .reveal-seed-phrase__reveal-button',
      );
      await driver.clickElement(byRevealButton);
      await driver.delay(regularDelayMs);

      const revealedSeedPhrase = await driver.findElement(
        By.css('.reveal-seed-phrase__secret-words'),
      );
      seedPhrase = await revealedSeedPhrase.getText();
      assert.equal(seedPhrase.split(' ').length, 12);
      await driver.delay(regularDelayMs);

      await driver.clickElement(
        By.xpath(
          `//button[contains(text(), '${enLocaleMessages.next.message}')]`,
        ),
      );
      await driver.delay(regularDelayMs);
    });

    async function clickWordAndWait(word) {
      await driver.clickElement(
        By.css(
          `[data-testid="seed-phrase-sorted"] [data-testid="draggable-seed-${word}"]`,
        ),
      );
      await driver.delay(tinyDelayMs);
    }

    it('can retype the seed phrase', async function () {
      const words = seedPhrase.split(' ');

      for (const word of words) {
        await clickWordAndWait(word);
      }

      await driver.clickElement(
        By.xpath(`//button[contains(text(), 'Confirm')]`),
      );
      await driver.delay(regularDelayMs);
    });

    it('clicks through the success screen', async function () {
      await driver.findElement(
        By.xpath(`//div[contains(text(), 'Congratulations')]`),
      );
      await driver.clickElement(
        By.xpath(
          `//button[contains(text(), '${enLocaleMessages.endOfFlowMessage10.message}')]`,
        ),
      );
      await driver.delay(regularDelayMs);
    });
  });

  describe('Import seed phrase', function () {
    it('logs out of the vault', async function () {
      await driver.clickElement(By.css('.account-menu__icon'));
      await driver.delay(regularDelayMs);

      const lockButton = await driver.findClickableElement(
        By.css('.account-menu__lock-button'),
      );
      assert.equal(await lockButton.getText(), 'Lock');
      await lockButton.click();
      await driver.delay(regularDelayMs);
    });

    it('imports seed phrase', async function () {
      const restoreSeedLink = await driver.findClickableElement(
        By.css('.unlock-page__link--import'),
      );
      assert.equal(
        await restoreSeedLink.getText(),
        'Import using account seed phrase',
      );
      await restoreSeedLink.click();
      await driver.delay(regularDelayMs);

      await driver.clickElement(By.css('.import-account__checkbox-container'));

      const seedTextArea = await driver.findElement(By.css('textarea'));
      await seedTextArea.sendKeys(testSeedPhrase);
      await driver.delay(regularDelayMs);

      const passwordInputs = await driver.findElements(By.css('input'));
      await driver.delay(regularDelayMs);

      await passwordInputs[0].sendKeys('correct horse battery staple');
      await passwordInputs[1].sendKeys('correct horse battery staple');
      await driver.clickElement(
        By.xpath(
          `//button[contains(text(), '${enLocaleMessages.restore.message}')]`,
        ),
      );
      await driver.delay(regularDelayMs);
    });
  });

  describe('Swaps Feature', function () {
    it('', async function () {
      await driver.findClickableElement()
    });
  });
});
