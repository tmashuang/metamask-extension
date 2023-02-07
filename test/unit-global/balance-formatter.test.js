import currencyFormatter from 'currency-formatter';

describe('currencyFormatting', () => {
  const number = 10000;

  it('should return formatted currency for USD code', () => {
    const result = currencyFormatter.format(number, { code: 'USD' });

    expect(result).toStrictEqual('$10,000.00');
  });

  it('should return formatted currency for JPY code', () => {
    const result = currencyFormatter.format(number, { code: 'JPY' });

    expect(result).toStrictEqual('¥10,000');
  });
});
