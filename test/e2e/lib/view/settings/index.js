export async function enableAdvancedGasControls (page) {
  await page.click('[data-testid="advanced-setting-advanced-gas-inline"] .settings-page__content-item-col > div > div')
}