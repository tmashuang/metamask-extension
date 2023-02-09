import { getCustomTxParamsData } from './confirm-approve.util';

describe('Confirm Approve Util', () => {
  it('should', () => {
    const resultData =
      '0x095ea7b3000000000000000000000000c42edfcc21ed14dda456aa0756c153f7985d88130000000000000000000000000000000001812f9cf7920e2b66973e2000000000';

    const hex =
      '0x095ea7b3000000000000000000000000c42edfcc21ed14dda456aa0756c153f7985d88130000000000000000000000000000000000000000000000000000000000000000';
    const customPermissionAmount = 2000000000000000000;
    const decimals = 18;

    const data = getCustomTxParamsData(hex, {
      customPermissionAmount,
      decimals,
    });

    expect(data).toStrictEqual(resultData);
  });
});
