const { strict: assert } = require('assert');
const {
  convertToHexValue,
  withFixtures,
  openDapp,
  DAPP_URL,
  DAPP_ONE_URL,
  unlockWallet,
  WINDOW_TITLES,
  defaultGanacheOptions,
} = require('../helpers');
const FixtureBuilder = require('../fixture-builder');

describe('Multi injected provider interactions', function () {
  it('should', async function () {
    await withFixtures(
      {
        dapp: true,
        fixtures: new FixtureBuilder().build(),
        ganacheOptions: defaultGanacheOptions,
        title: this.test.title,
      },
      async ({ driver }) => {
        await driver.navigate();
        await openDapp(driver);

        assert.equal(true, false);
      },
    );
  });
});
