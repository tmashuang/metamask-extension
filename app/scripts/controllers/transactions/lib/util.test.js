import { TRANSACTION_ENVELOPE_TYPES } from '../../../../../shared/constants/transaction';
import { BURN_ADDRESS } from '../../../../../shared/modules/hexstring-utils';
import { GAS_RECOMMENDATIONS } from '../../../../../shared/constants/gas';
import * as txUtils from './util';

describe('txUtils', () => {
  describe('#validateTxParams', () => {
    it('does not throw for positive values', () => {
      const sample = {
        from: '0x1678a085c290ebd122dc42cba69373b5953b831d',
        to: '0xc42edfcc21ed14dda456aa0756c153f7985d8813',
        value: '0x01',
      };
      expect(() => txUtils.validateTxParams(sample)).not.toThrow();
    });

    it('throws for invalid params value', () => {
      expect(() => txUtils.validateTxParams()).toThrow({
        message: 'Invalid transaction params: must be an object.',
      });
      expect(() => txUtils.validateTxParams(null)).toThrow({
        message: 'Invalid transaction params: must be an object.',
      });
      expect(() => txUtils.validateTxParams(true)).toThrow({
        message: 'Invalid transaction params: must be an object.',
      });
      expect(() => txUtils.validateTxParams([])).toThrow({
        message: 'Invalid transaction params: must be an object.',
      });
    });

    it('throws for missing "to" and "data"', () => {
      const sample = {
        from: '0x1678a085c290ebd122dc42cba69373b5953b831d',
        value: '0x01',
      };
      expect(() => txUtils.validateTxParams(sample)).toThrow({
        message:
          'Invalid transaction params: must specify "data" for contract deployments, or "to" (and optionally "data") for all other types of transactions.',
      });
    });

    it('throws for negative values', () => {
      const sample = {
        from: '0x1678a085c290ebd122dc42cba69373b5953b831d',
        to: '0xc42edfcc21ed14dda456aa0756c153f7985d8813',
        value: '-0x01',
      };
      expect(() => txUtils.validateTxParams(sample)).toThrow({
        message: 'Invalid transaction value "-0x01": not a positive number.',
      });
    });

    describe('when validating gasPrice', () => {
      it('should error when specifying incorrect type', () => {
        const txParams = {
          gasPrice: '0x1',
          type: TRANSACTION_ENVELOPE_TYPES.FEE_MARKET,
          to: BURN_ADDRESS,
        };

        expect(() => {
          txUtils.validateTxParams(txParams);
        }).toThrow(
          'specified type "0x2" but included a gasPrice instead of maxFeePerGas and maxPriorityFeePerGas',
        );
      });

      it('should error when gasPrice is not a string', () => {
        const txParams = {
          gasPrice: 1,
          to: BURN_ADDRESS,
        };

        expect(() => {
          txUtils.validateTxParams(txParams);
        }).toThrow(
          'Invalid transaction params: gasPrice is not a string. got: (1)',
        );
      });

      it('should error when specifying maxFeePerGas', () => {
        const txParams = {
          gasPrice: '0x1',
          maxFeePerGas: '0x1',
          to: BURN_ADDRESS,
        };

        expect(() => {
          txUtils.validateTxParams(txParams);
        }).toThrow(
          'Invalid transaction params: specified gasPrice but also included maxFeePerGas, these cannot be mixed',
        );
      });

      it('should error when specifying maxPriorityFeePerGas', () => {
        const txParams = {
          gasPrice: '0x1',
          maxPriorityFeePerGas: '0x1',
          to: BURN_ADDRESS,
        };

        expect(() => {
          txUtils.validateTxParams(txParams);
        }).toThrow(
          'Invalid transaction params: specified gasPrice but also included maxPriorityFeePerGas, these cannot be mixed',
        );
      });

      it('should validate if gasPrice is set with no type or EIP-1559 gas fields', () => {
        const txParams = {
          gasPrice: '0x1',
          to: BURN_ADDRESS,
        };
        expect(() => txUtils.validateTxParams(txParams)).not.toThrow();
      });

      it('should validate if gasPrice is set with a type of "0x0"', () => {
        const txParams = {
          gasPrice: '0x1',
          type: TRANSACTION_ENVELOPE_TYPES.LEGACY,
          to: BURN_ADDRESS,
        };
        expect(() => txUtils.validateTxParams(txParams)).not.toThrow();
      });
    });

    describe('when validating maxFeePerGas', () => {
      it('should error when specifying incorrect type', () => {
        const txParams = {
          maxFeePerGas: '0x1',
          type: TRANSACTION_ENVELOPE_TYPES.LEGACY,
          to: BURN_ADDRESS,
        };

        expect(() => {
          txUtils.validateTxParams(txParams);
        }).toThrow(
          'Invalid transaction envelope type: specified type "0x0" but including maxFeePerGas and maxPriorityFeePerGas requires type: "0x2"',
        );
      });

      it('should error when maxFeePerGas is not a string', () => {
        const txParams = {
          maxFeePerGas: 1,
          to: BURN_ADDRESS,
        };

        expect(() => {
          txUtils.validateTxParams(txParams);
        }).toThrow(
          'Invalid transaction params: maxFeePerGas is not a string. got: (1)',
        );
      });

      it('should error when specifying gasPrice', () => {
        const txParams = {
          gasPrice: '0x1',
          maxFeePerGas: '0x1',
          to: BURN_ADDRESS,
        };

        expect(() => {
          txUtils.validateTxParams(txParams);
        }).toThrow(
          'Invalid transaction params: specified gasPrice but also included maxFeePerGas, these cannot be mixed',
        );
      });

      it('should validate if maxFeePerGas is set with no type or gasPrice field', () => {
        const txParams = {
          maxFeePerGas: '0x1',
          to: BURN_ADDRESS,
        };
        expect(() => txUtils.validateTxParams(txParams)).not.toThrow();
      });

      it('should validate if maxFeePerGas is set with a type of "0x2"', () => {
        const txParams = {
          maxFeePerGas: '0x1',
          type: TRANSACTION_ENVELOPE_TYPES.FEE_MARKET,
          to: BURN_ADDRESS,
        };
        expect(() => txUtils.validateTxParams(txParams)).not.toThrow();
      });
    });

    describe('when validating maxPriorityFeePerGas', () => {
      it('should error when specifying incorrect type', () => {
        const txParams = {
          maxPriorityFeePerGas: '0x1',
          type: TRANSACTION_ENVELOPE_TYPES.LEGACY,
          to: BURN_ADDRESS,
        };

        expect(() => {
          txUtils.validateTxParams(txParams);
        }).toThrow(
          'Invalid transaction envelope type: specified type "0x0" but including maxFeePerGas and maxPriorityFeePerGas requires type: "0x2"',
        );
      });

      it('should error when maxFeePerGas is not a string', () => {
        const txParams = {
          maxPriorityFeePerGas: 1,
          to: BURN_ADDRESS,
        };

        expect(() => {
          txUtils.validateTxParams(txParams);
        }).toThrow(
          'Invalid transaction params: maxPriorityFeePerGas is not a string. got: (1)',
        );
      });

      it('should error when specifying gasPrice', () => {
        const txParams = {
          gasPrice: '0x1',
          maxPriorityFeePerGas: '0x1',
          to: BURN_ADDRESS,
        };

        expect(() => {
          txUtils.validateTxParams(txParams);
        }).toThrow(
          'Invalid transaction params: specified gasPrice but also included maxPriorityFeePerGas, these cannot be mixed',
        );
      });

      it('should validate if maxPriorityFeePerGas is set with no type or gasPrice field', () => {
        const txParams = {
          maxPriorityFeePerGas: '0x1',
          to: BURN_ADDRESS,
        };
        expect(() => txUtils.validateTxParams(txParams)).not.toThrow();
      });

      it('should validate if maxPriorityFeePerGas is set with a type of "0x2"', () => {
        const txParams = {
          maxPriorityFeePerGas: '0x1',
          type: TRANSACTION_ENVELOPE_TYPES.FEE_MARKET,
          to: BURN_ADDRESS,
        };
        expect(() => txUtils.validateTxParams(txParams)).not.toThrow();
      });
    });

    describe('when validating EIP-1559 transactions', () => {
      it('should error when network does not support EIP-1559', () => {
        const txParams = {
          maxPriorityFeePerGas: '0x1',
          maxFeePerGas: '0x1',
          to: BURN_ADDRESS,
        };

        expect(() => {
          txUtils.validateTxParams(txParams, false);
        }).toThrow(
          'Invalid transaction params: params specify an EIP-1559 transaction but the current network does not support EIP-1559',
        );
      });
      it('should validate when network does support EIP-1559', () => {
        const txParams = {
          maxPriorityFeePerGas: '0x1',
          maxFeePerGas: '0x1',
          to: BURN_ADDRESS,
        };
        expect(() => txUtils.validateTxParams(txParams, true)).not.toThrow();
      });
    });
  });

  describe('#normalizeTxParams', () => {
    it('should normalize txParams', () => {
      const txParams = {
        chainId: '0x1',
        from: 'a7df1beDBF813f57096dF77FCd515f0B3900e402',
        to: null,
        data: '68656c6c6f20776f726c64',
        random: 'hello world',
        gasPrice: '1',
        maxFeePerGas: '1',
        maxPriorityFeePerGas: '1',
        estimateSuggested: GAS_RECOMMENDATIONS.MEDIUM,
        estimateUsed: GAS_RECOMMENDATIONS.HIGH,
        type: '1',
      };

      let normalizedTxParams = txUtils.normalizeTxParams(txParams);

      expect(normalizedTxParams.chainId).toBeUndefined();
      expect(normalizedTxParams.to).toBeUndefined();
      expect(normalizedTxParams.from.slice(0, 2)).toStrictEqual('0x');
      expect(normalizedTxParams.data.slice(0, 2)).toStrictEqual('0x');
      expect(normalizedTxParams.random).toBeUndefined();

      txParams.to = 'a7df1beDBF813f57096dF77FCd515f0B3900e402';
      normalizedTxParams = txUtils.normalizeTxParams(txParams);
      expect(normalizedTxParams.to.slice(0, 2)).toStrictEqual('0x');

      expect(normalizedTxParams.gasPrice).toStrictEqual('0x1');
      // 'gasPrice should be hex-prefixed',

      expect(normalizedTxParams.maxFeePerGas).toStrictEqual('0x1');
      // 'maxFeePerGas should be hex-prefixed',

      expect(normalizedTxParams.maxPriorityFeePerGas).toStrictEqual('0x1');
      // 'maxPriorityFeePerGas should be hex-prefixed',

      expect(normalizedTxParams.type).toStrictEqual('0x1');
      // 'type should be hex-prefixed',

      expect(normalizedTxParams.estimateSuggested).toStrictEqual('medium');
      // 'estimateSuggested should be the string originally provided',

      expect(normalizedTxParams.estimateUsed).toStrictEqual('high');
      // 'estimateSuggested should be the string originally provided',
    });
  });

  describe('#validateRecipient', () => {
    it('removes recipient for txParams with 0x when contract data is provided', () => {
      const zeroRecipientDataTxParams = {
        from: '0x1678a085c290ebd122dc42cba69373b5953b831d',
        to: '0x',
        data: 'bytecode',
      };
      const sanitizedTxParams = txUtils.validateRecipient(
        zeroRecipientDataTxParams,
      );
      expect(sanitizedTxParams).toStrictEqual({
        from: '0x1678a085c290ebd122dc42cba69373b5953b831d',
        data: 'bytecode',
      });
    });

    it('should error when recipient is 0x', () => {
      const zeroRecipientTxParams = {
        from: '0x1678a085c290ebd122dc42cba69373b5953b831d',
        to: '0x',
      };
      expect(() => {
        txUtils.validateRecipient(zeroRecipientTxParams);
      }).toThrow('Invalid "to" address');
    });
  });

  describe('#validateFrom', () => {
    it('should error when from is not a hex string', () => {
      // where from is undefined
      const txParams = {};
      expect(() => {
        txUtils.validateFrom(txParams);
      }).toThrow('Invalid "from" address "undefined": not a string.');

      // where from is array
      txParams.from = [];
      expect(() => {
        txUtils.validateFrom(txParams);
      }).toThrow('Invalid "from" address "": not a string.');

      // where from is a object
      txParams.from = {};
      expect(() => {
        txUtils.validateFrom(txParams);
      }).toThrow('Invalid "from" address "[object Object]": not a string.');

      // where from is a invalid address
      txParams.from = 'im going to fail';
      expect(() => {
        txUtils.validateFrom(txParams);
      }).toThrow('Invalid "from" address.');

      // should run
      txParams.from = '0x1678a085c290ebd122dc42cba69373b5953b831d';
      txUtils.validateFrom(txParams);
    });
  });
});
