import { TransactionEnvelopeType } from '../../../../../shared/constants/transaction';
import { BURN_ADDRESS } from '../../../../../shared/modules/hexstring-utils';
import { GasRecommendations } from '../../../../../shared/constants/gas';
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

    it('throws for invalid params value', async () => {
      await expect(
        async () => await txUtils.validateTxParams(),
      ).rejects.toThrow('Invalid transaction params: must be an object.');

      await expect(
        async () => await txUtils.validateTxParams(null),
      ).rejects.toThrow('Invalid transaction params: must be an object.');

      await expect(
        async () => await txUtils.validateTxParams(true),
      ).rejects.toThrow('Invalid transaction params: must be an object.');

      await expect(
        async () => await txUtils.validateTxParams([]),
      ).rejects.toThrow('Invalid transaction params: must be an object.');
    });

    // TODO: Convert
    it('throws for data out of bounds buffer overrun', function () {
      const sample = {
        from: '0x1678a085c290ebd122dc42cba69373b5953b831d',
        to: '0xfbb5595c18ca76bab52d66188e4ca50c7d95f77a',
        data: '0xa9059cbb00000000000000000000000011b6A5fE2906F3354145613DB0d99CEB51f604C90000000000000000000000000000000000000000000000004563918244F400',
      };
      assert.throws(() => txUtils.validateTxParams(sample), {
        message:
          'Invalid transaction params: data out-of-bounds, BUFFER_OVERRUN.',
      });
    });

    it('throws for missing "to" and "data"', function () {
    it('throws for missing "to" and "data"', async () => {
      const sample = {
        from: '0x1678a085c290ebd122dc42cba69373b5953b831d',
        value: '0x01',
      };
      await expect(
        async () => await txUtils.validateTxParams(sample),
      ).rejects.toThrow(
        'Invalid transaction params: must specify "data" for contract deployments, or "to" (and optionally "data") for all other types of transactions.',
      );
    });

    it('throws for negative values', async () => {
      const sample = {
        from: '0x1678a085c290ebd122dc42cba69373b5953b831d',
        to: '0xc42edfcc21ed14dda456aa0756c153f7985d8813',
        value: '-0x01',
      };
      await expect(
        async () => await txUtils.validateTxParams(sample),
      ).rejects.toThrow(
        'Invalid transaction value "-0x01": not a positive number.',
      );
    });

    describe('when validating gasPrice', () => {
      it('should error when specifying incorrect type', async () => {
        const txParams = {
          gasPrice: '0x1',
          type: TransactionEnvelopeType.feeMarket,
          to: BURN_ADDRESS,
        };

        await expect(async () => {
          await txUtils.validateTxParams(txParams);
        }).rejects.toThrow(
          `Invalid transaction envelope type: specified type "0x2" but included a gasPrice instead of maxFeePerGas and maxPriorityFeePerGas`,
        );
      });

      it('should error when gasPrice is not a string', async () => {
        const txParams = {
          gasPrice: 1,
          to: BURN_ADDRESS,
        };

        await expect(
          async () => await txUtils.validateTxParams(txParams),
        ).rejects.toThrow(
          'Invalid transaction params: gasPrice is not a string. got: (1)',
        );
      });

      it('should error when specifying maxFeePerGas', async () => {
        const txParams = {
          gasPrice: '0x1',
          maxFeePerGas: '0x1',
          to: BURN_ADDRESS,
        };

        await expect(
          async () => await txUtils.validateTxParams(txParams),
        ).rejects.toThrow(
          'Invalid transaction params: specified gasPrice but also included maxFeePerGas, these cannot be mixed',
        );
      });

      it('should error when specifying maxPriorityFeePerGas', async () => {
        const txParams = {
          gasPrice: '0x1',
          maxPriorityFeePerGas: '0x1',
          to: BURN_ADDRESS,
        };

        await expect(
          async () => await txUtils.validateTxParams(txParams),
        ).rejects.toThrow(
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
          type: TransactionEnvelopeType.legacy,
          to: BURN_ADDRESS,
        };
        expect(() => txUtils.validateTxParams(txParams)).not.toThrow();
      });
    });

    describe('when validating maxFeePerGas', () => {
      it('should error when specifying incorrect type', async () => {
        const txParams = {
          maxFeePerGas: '0x1',
          type: TransactionEnvelopeType.legacy,
          to: BURN_ADDRESS,
        };

        await expect(
          async () => await txUtils.validateTxParams(txParams),
        ).rejects.toThrow(
          'Invalid transaction envelope type: specified type "0x0" but including maxFeePerGas and maxPriorityFeePerGas requires type: "0x2"',
        );
      });

      it('should error when maxFeePerGas is not a string', async () => {
        const txParams = {
          maxFeePerGas: 1,
          to: BURN_ADDRESS,
        };

        await expect(
          async () => await txUtils.validateTxParams(txParams),
        ).rejects.toThrow(
          'Invalid transaction params: maxFeePerGas is not a string. got: (1)',
        );
      });

      it('should error when specifying gasPrice', async () => {
        const txParams = {
          gasPrice: '0x1',
          maxFeePerGas: '0x1',
          to: BURN_ADDRESS,
        };

        await expect(
          async () => await txUtils.validateTxParams(txParams),
        ).rejects.toThrow(
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
          type: TransactionEnvelopeType.feeMarket,
          to: BURN_ADDRESS,
        };
        expect(() => txUtils.validateTxParams(txParams)).not.toThrow();
      });
    });

    describe('when validating maxPriorityFeePerGas', () => {
      it('should error when specifying incorrect type', async () => {
        const txParams = {
          maxPriorityFeePerGas: '0x1',
          type: TransactionEnvelopeType.legacy,
          to: BURN_ADDRESS,
        };

        await expect(
          async () => await txUtils.validateTxParams(txParams),
        ).rejects.toThrow(
          'Invalid transaction envelope type: specified type "0x0" but including maxFeePerGas and maxPriorityFeePerGas requires type: "0x2"',
        );
      });

      it('should error when maxFeePerGas is not a string', async () => {
        const txParams = {
          maxPriorityFeePerGas: 1,
          to: BURN_ADDRESS,
        };

        await expect(
          async () => await txUtils.validateTxParams(txParams),
        ).rejects.toThrow(
          'Invalid transaction params: maxPriorityFeePerGas is not a string. got: (1)',
        );
      });

      it('should error when specifying gasPrice', async () => {
        const txParams = {
          gasPrice: '0x1',
          maxPriorityFeePerGas: '0x1',
          to: BURN_ADDRESS,
        };

        await expect(
          async () => await txUtils.validateTxParams(txParams),
        ).rejects.toThrow(
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
          type: TransactionEnvelopeType.feeMarket,
          to: BURN_ADDRESS,
        };
        expect(() => txUtils.validateTxParams(txParams)).not.toThrow();
      });
    });

    describe('when validating EIP-1559 transactions', () => {
      it('should error when network does not support EIP-1559', async () => {
        const txParams = {
          maxPriorityFeePerGas: '0x1',
          maxFeePerGas: '0x1',
          to: BURN_ADDRESS,
        };
        await expect(
          async () => await txUtils.validateTxParams(txParams, false),
        ).rejects.toThrow(
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
        estimateSuggested: GasRecommendations.medium,
        estimateUsed: GasRecommendations.high,
        type: '1',
      };

      let normalizedTxParams = txUtils.normalizeTxParams(txParams);

      expect(normalizedTxParams.chainId).toBeUndefined();
      expect(normalizedTxParams.to).toBeUndefined(); // there should be no to address if null
      expect(normalizedTxParams.from.slice(0, 2)).toStrictEqual('0x'); // from should be hex-prefixed
      expect(normalizedTxParams.data.slice(0, 2)).toStrictEqual('0x'); // data should be hex-prefixed

      expect(normalizedTxParams).not.toHaveProperty('random');
      //   ('random' in normalizedTxParams),
      //   'there should be no random key in normalizedTxParams',
      // );

      txParams.to = 'a7df1beDBF813f57096dF77FCd515f0B3900e402';
      normalizedTxParams = txUtils.normalizeTxParams(txParams);
      expect(normalizedTxParams.to.slice(0, 2)).toStrictEqual('0x'); // 'to should be hex-prefixed',

      expect(normalizedTxParams.gasPrice).toStrictEqual('0x1'); // 'gasPrice should be hex-prefixed',

      expect(normalizedTxParams.maxFeePerGas).toStrictEqual('0x1'); // 'maxFeePerGas should be hex-prefixed',

<<<<<<< Updated upstream
      assert.equal(
        normalizedTxParams.estimateSuggested,
        GasRecommendations.medium,
        'estimateSuggested should be the string originally provided',
      );
      assert.equal(
        normalizedTxParams.estimateUsed,
        GasRecommendations.high,
        'estimateSuggested should be the string originally provided',
      );
=======
      expect(normalizedTxParams.maxPriorityFeePerGas).toStrictEqual('0x1'); // 'maxPriorityFeePerGas should be hex-prefixed',

      expect(normalizedTxParams.type).toStrictEqual('0x1'); // 'type should be hex-prefixed',

      expect(normalizedTxParams.estimateSuggested).toStrictEqual(
        GAS_RECOMMENDATIONS.MEDIUM,
      ); // 'estimateSuggested should be the string originally provided',

      expect(normalizedTxParams.estimateUsed).toStrictEqual(
        GAS_RECOMMENDATIONS.HIGH,
      ); // 'estimateSuggested should be the string originally provided',
>>>>>>> Stashed changes
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
      expect(sanitizedTxParams).toStrictEqual(
        {
          from: '0x1678a085c290ebd122dc42cba69373b5953b831d',
          data: 'bytecode',
        },
        'no recipient with 0x',
      );
    });

    it('should error when recipient is 0x', async () => {
      const zeroRecipientTxParams = {
        from: '0x1678a085c290ebd122dc42cba69373b5953b831d',
        to: '0x',
      };
      await expect(async () => {
        await txUtils.validateRecipient(zeroRecipientTxParams);
      }).rejects.toThrow(`Invalid "to" address`);
    });
  });

  describe('#validateFrom', () => {
    it('should error when from is not a hex string', async () => {
      // where from is undefined
      const txParams = {};
      await expect(async () => {
        await txUtils.validateFrom(txParams);
      }).rejects.toThrow(
        `Invalid "from" address "${txParams.from}": not a string`,
      );

      // where from is array
      txParams.from = [];
      await expect(async () => {
        await txUtils.validateFrom(txParams);
      }).rejects.toThrow(
        `Invalid "from" address "${txParams.from}": not a string`,
      );

      // where from is a object
      txParams.from = {};
      await expect(async () => {
        await txUtils.validateFrom(txParams);
      }).rejects.toThrow(
        `Invalid "from" address "${txParams.from}": not a string`,
      );

      // where from is a invalid address
      txParams.from = 'im going to fail';
      await expect(async () => {
        await txUtils.validateFrom(txParams);
      }).rejects.toThrow(`Invalid "from" address`);

      // should run
      txParams.from = '0x1678a085c290ebd122dc42cba69373b5953b831d';
      expect(() => txUtils.validateFrom(txParams)).not.toThrow();
    });
  });
});
