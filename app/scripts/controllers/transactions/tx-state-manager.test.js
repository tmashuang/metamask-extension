import sinon from 'sinon';
import { TRANSACTION_STATUSES } from '../../../../shared/constants/transaction';
import {
  KOVAN_CHAIN_ID,
  KOVAN_NETWORK_ID,
} from '../../../../shared/constants/network';
import TxStateManager from './tx-state-manager';
import { snapshotFromTxMeta } from './lib/tx-state-history-helpers';

const VALID_ADDRESS = '0x0000000000000000000000000000000000000000';
const VALID_ADDRESS_TWO = '0x0000000000000000000000000000000000000001';
describe('TransactionStateManager', () => {
  let txStateManager;
  const currentNetworkId = KOVAN_NETWORK_ID;
  const currentChainId = KOVAN_CHAIN_ID;
  const otherNetworkId = '2';

  beforeEach(() => {
    txStateManager = new TxStateManager({
      initState: {
        transactions: {},
      },
      txHistoryLimit: 10,
      getNetwork: () => currentNetworkId,
      getCurrentChainId: () => currentChainId,
    });
  });

  describe('#setTxStatusSigned', () => {
    it('sets the tx status to signed', () => {
      const tx = {
        id: 1,
        status: TRANSACTION_STATUSES.UNAPPROVED,
        metamaskNetworkId: currentNetworkId,
        txParams: {
          to: VALID_ADDRESS,
          from: VALID_ADDRESS,
        },
      };
      txStateManager.addTransaction(tx);
      txStateManager.setTxStatusSigned(1);
      const result = txStateManager.getTransactions();
      expect(Array.isArray(result)).toStrictEqual(true);
      expect(result).toHaveLength(1);
      expect(result[0].status).toStrictEqual(TRANSACTION_STATUSES.SIGNED);
    });

    it('should emit a signed event to signal the execution of callback', () => {
      const tx = {
        id: 1,
        status: TRANSACTION_STATUSES.UNAPPROVED,
        metamaskNetworkId: currentNetworkId,
        txParams: {
          to: VALID_ADDRESS,
          from: VALID_ADDRESS,
        },
      };
      const clock = sinon.useFakeTimers();
      const onSigned = sinon.spy();

      txStateManager.addTransaction(tx);
      txStateManager.on('1:signed', onSigned);
      txStateManager.setTxStatusSigned(1);
      clock.runAll();
      clock.restore();

      expect(onSigned.calledOnce).toStrictEqual(true);
    });
  });

  describe('#setTxStatusRejected', () => {
    it('sets the tx status to rejected and removes it from history', () => {
      const tx = {
        id: 1,
        status: TRANSACTION_STATUSES.UNAPPROVED,
        metamaskNetworkId: currentNetworkId,
        txParams: {
          to: VALID_ADDRESS,
          from: VALID_ADDRESS,
        },
      };
      txStateManager.addTransaction(tx);
      txStateManager.setTxStatusRejected(1);
      const result = txStateManager.getTransactions();
      expect(Array.isArray(result)).toStrictEqual(true);
      expect(result).toHaveLength(0);
    });

    it('should emit a rejected event to signal the execution of callback', () => {
      const tx = {
        id: 1,
        status: TRANSACTION_STATUSES.UNAPPROVED,
        metamaskNetworkId: currentNetworkId,
        txParams: {
          to: VALID_ADDRESS,
          from: VALID_ADDRESS,
        },
      };
      const clock = sinon.useFakeTimers();
      const onSigned = sinon.spy();

      txStateManager.addTransaction(tx);
      txStateManager.on('1:rejected', onSigned);
      txStateManager.setTxStatusRejected(1);
      clock.runAll();
      clock.restore();

      expect(onSigned.calledOnce).toStrictEqual(true);
    });
  });

  describe('#getTransactions', () => {
    it('when new should return empty array', () => {
      const result = txStateManager.getTransactions();
      expect(Array.isArray(result)).toStrictEqual(true);
      expect(result).toHaveLength(0);
    });

    it('should return a full list of transactions', () => {
      const submittedTx = {
        id: 0,
        metamaskNetworkId: currentNetworkId,
        time: 0,
        txParams: {
          from: '0xAddress',
          to: '0xRecipient',
          nonce: '0x0',
        },
        status: TRANSACTION_STATUSES.SUBMITTED,
      };

      const confirmedTx = {
        id: 3,
        metamaskNetworkId: currentNetworkId,
        time: 3,
        txParams: {
          from: '0xAddress',
          to: '0xRecipient',
          nonce: '0x3',
        },
        status: TRANSACTION_STATUSES.CONFIRMED,
      };

      const txm = new TxStateManager({
        initState: {
          transactions: {
            [submittedTx.id]: submittedTx,
            [confirmedTx.id]: confirmedTx,
          },
        },
        getNetwork: () => currentNetworkId,
        getCurrentChainId: () => currentChainId,
      });

      expect(txm.getTransactions()).toStrictEqual([submittedTx, confirmedTx]);
    });

    it('should return a list of transactions, limited by N unique nonces when there are NO duplicates', () => {
      const submittedTx0 = {
        id: 0,
        metamaskNetworkId: currentNetworkId,
        time: 0,
        txParams: {
          from: '0xAddress',
          to: '0xRecipient',
          nonce: '0x0',
        },
        status: TRANSACTION_STATUSES.SUBMITTED,
      };

      const unapprovedTx1 = {
        id: 1,
        metamaskNetworkId: currentNetworkId,
        time: 1,
        txParams: {
          from: '0xAddress',
          to: '0xRecipient',
          nonce: '0x1',
        },
        status: TRANSACTION_STATUSES.UNAPPROVED,
      };

      const approvedTx2 = {
        id: 2,
        metamaskNetworkId: currentNetworkId,
        time: 2,
        txParams: {
          from: '0xAddress',
          to: '0xRecipient',
          nonce: '0x2',
        },
        status: TRANSACTION_STATUSES.APPROVED,
      };

      const confirmedTx3 = {
        id: 3,
        metamaskNetworkId: currentNetworkId,
        time: 3,
        txParams: {
          from: '0xAddress',
          to: '0xRecipient',
          nonce: '0x3',
        },
        status: TRANSACTION_STATUSES.CONFIRMED,
      };

      const txm = new TxStateManager({
        initState: {
          transactions: {
            [submittedTx0.id]: submittedTx0,
            [unapprovedTx1.id]: unapprovedTx1,
            [approvedTx2.id]: approvedTx2,
            [confirmedTx3.id]: confirmedTx3,
          },
        },
        getNetwork: () => currentNetworkId,
        getCurrentChainId: () => currentChainId,
      });

      expect(txm.getTransactions({ limit: 2 })).toStrictEqual([
        approvedTx2,
        confirmedTx3,
      ]);
    });

    it('should return a list of transactions, limited by N unique nonces when there ARE duplicates', () => {
      const submittedTx0 = {
        id: 0,
        metamaskNetworkId: currentNetworkId,
        time: 0,
        txParams: {
          from: '0xAddress',
          to: '0xRecipient',
          nonce: '0x0',
        },
        status: TRANSACTION_STATUSES.SUBMITTED,
      };
      const submittedTx0Dupe = {
        id: 1,
        metamaskNetworkId: currentNetworkId,
        time: 0,
        txParams: {
          from: '0xAddress',
          to: '0xRecipient',
          nonce: '0x0',
        },
        status: TRANSACTION_STATUSES.SUBMITTED,
      };

      const unapprovedTx1 = {
        id: 2,
        metamaskNetworkId: currentNetworkId,
        chainId: currentChainId,
        time: 1,
        txParams: {
          from: '0xAddress',
          to: '0xRecipient',
          nonce: '0x1',
        },
        status: TRANSACTION_STATUSES.UNAPPROVED,
      };

      const approvedTx2 = {
        id: 3,
        metamaskNetworkId: currentNetworkId,
        time: 2,
        txParams: {
          from: '0xAddress',
          to: '0xRecipient',
          nonce: '0x2',
        },
        status: TRANSACTION_STATUSES.APPROVED,
      };
      const approvedTx2Dupe = {
        id: 4,
        metamaskNetworkId: currentNetworkId,
        chainId: currentChainId,
        time: 2,
        txParams: {
          from: '0xAddress',
          to: '0xRecipient',
          nonce: '0x2',
        },
        status: TRANSACTION_STATUSES.APPROVED,
      };

      const failedTx3 = {
        id: 5,
        metamaskNetworkId: currentNetworkId,
        time: 3,
        txParams: {
          from: '0xAddress',
          to: '0xRecipient',
          nonce: '0x3',
        },
        status: TRANSACTION_STATUSES.FAILED,
      };
      const failedTx3Dupe = {
        id: 6,
        metamaskNetworkId: currentNetworkId,
        chainId: currentChainId,
        time: 3,
        txParams: {
          from: '0xAddress',
          to: '0xRecipient',
          nonce: '0x3',
        },
        status: TRANSACTION_STATUSES.FAILED,
      };

      const txm = new TxStateManager({
        initState: {
          transactions: {
            [submittedTx0.id]: submittedTx0,
            [submittedTx0Dupe.id]: submittedTx0Dupe,

            [unapprovedTx1.id]: unapprovedTx1,
            [approvedTx2.id]: approvedTx2,
            [approvedTx2Dupe.id]: approvedTx2Dupe,

            [failedTx3.id]: failedTx3,
            [failedTx3Dupe.id]: failedTx3Dupe,
          },
        },
        getNetwork: () => currentNetworkId,
        getCurrentChainId: () => currentChainId,
      });

      expect(txm.getTransactions({ limit: 2 })).toStrictEqual([
        approvedTx2,
        approvedTx2Dupe,
        failedTx3,
        failedTx3Dupe,
      ]);
    });

    it('returns a tx with the requested data', () => {
      const txMetas = [
        {
          id: 0,
          status: TRANSACTION_STATUSES.UNAPPROVED,
          txParams: { from: VALID_ADDRESS, to: VALID_ADDRESS_TWO },
          metamaskNetworkId: currentNetworkId,
        },
        {
          id: 1,
          status: TRANSACTION_STATUSES.UNAPPROVED,
          txParams: { from: VALID_ADDRESS, to: VALID_ADDRESS_TWO },
          metamaskNetworkId: currentNetworkId,
        },
        {
          id: 2,
          status: TRANSACTION_STATUSES.UNAPPROVED,
          txParams: { from: VALID_ADDRESS, to: VALID_ADDRESS_TWO },
          metamaskNetworkId: currentNetworkId,
        },
        {
          id: 3,
          status: TRANSACTION_STATUSES.UNAPPROVED,
          txParams: { from: VALID_ADDRESS_TWO, to: VALID_ADDRESS },
          metamaskNetworkId: currentNetworkId,
        },
        {
          id: 4,
          status: TRANSACTION_STATUSES.UNAPPROVED,
          txParams: { from: VALID_ADDRESS_TWO, to: VALID_ADDRESS },
          metamaskNetworkId: currentNetworkId,
        },
        {
          id: 5,
          status: TRANSACTION_STATUSES.CONFIRMED,
          txParams: { from: VALID_ADDRESS, to: VALID_ADDRESS_TWO },
          metamaskNetworkId: currentNetworkId,
        },
        {
          id: 6,
          status: TRANSACTION_STATUSES.CONFIRMED,
          txParams: { from: VALID_ADDRESS, to: VALID_ADDRESS_TWO },
          metamaskNetworkId: currentNetworkId,
        },
        {
          id: 7,
          status: TRANSACTION_STATUSES.CONFIRMED,
          txParams: { from: VALID_ADDRESS_TWO, to: VALID_ADDRESS },
          metamaskNetworkId: currentNetworkId,
        },
        {
          id: 8,
          status: TRANSACTION_STATUSES.CONFIRMED,
          txParams: { from: VALID_ADDRESS_TWO, to: VALID_ADDRESS },
          metamaskNetworkId: currentNetworkId,
        },
        {
          id: 9,
          status: TRANSACTION_STATUSES.CONFIRMED,
          txParams: { from: VALID_ADDRESS_TWO, to: VALID_ADDRESS },
          metamaskNetworkId: currentNetworkId,
        },
      ];
      txMetas.forEach((txMeta) => txStateManager.addTransaction(txMeta));
      let searchCriteria;

      searchCriteria = {
        status: TRANSACTION_STATUSES.UNAPPROVED,
        from: VALID_ADDRESS,
      };
      expect(txStateManager.getTransactions({ searchCriteria })).toHaveLength(
        3,
        `getTransactions - ${JSON.stringify(searchCriteria)}`,
      );
      searchCriteria = {
        status: TRANSACTION_STATUSES.UNAPPROVED,
        to: VALID_ADDRESS,
      };
      expect(txStateManager.getTransactions({ searchCriteria })).toHaveLength(
        2,
        `getTransactions - ${JSON.stringify(searchCriteria)}`,
      );
      searchCriteria = {
        status: TRANSACTION_STATUSES.CONFIRMED,
        from: VALID_ADDRESS_TWO,
      };
      expect(txStateManager.getTransactions({ searchCriteria })).toHaveLength(
        3,
        `getTransactions - ${JSON.stringify(searchCriteria)}`,
      );
      searchCriteria = { status: TRANSACTION_STATUSES.CONFIRMED };
      expect(txStateManager.getTransactions({ searchCriteria })).toHaveLength(
        5,
        `getTransactions - ${JSON.stringify(searchCriteria)}`,
      );
      searchCriteria = { from: VALID_ADDRESS };
      expect(txStateManager.getTransactions({ searchCriteria })).toHaveLength(
        5,
        `getTransactions - ${JSON.stringify(searchCriteria)}`,
      );
      searchCriteria = { to: VALID_ADDRESS };
      expect(txStateManager.getTransactions({ searchCriteria })).toHaveLength(
        5,
        `getTransactions - ${JSON.stringify(searchCriteria)}`,
      );
      searchCriteria = {
        status: (status) => status !== TRANSACTION_STATUSES.CONFIRMED,
      };
      expect(txStateManager.getTransactions({ searchCriteria })).toHaveLength(
        5,
        `getTransactions - ${JSON.stringify(searchCriteria)}`,
      );
    });
  });

  describe('#addTransaction', () => {
    it('adds a tx returned in getTransactions', () => {
      const tx = {
        id: 1,
        status: TRANSACTION_STATUSES.CONFIRMED,
        metamaskNetworkId: currentNetworkId,
        txParams: {
          to: VALID_ADDRESS,
          from: VALID_ADDRESS,
        },
      };
      txStateManager.addTransaction(tx);
      const result = txStateManager.getTransactions();
      expect(Array.isArray(result)).toStrictEqual(true);
      expect(result).toHaveLength(1);
      expect(result[0].id).toStrictEqual(1);
    });

    it('throws error and does not add tx if txParams are invalid', () => {
      const validTxParams = {
        from: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
        to: '0x0039f22efb07a647557c7c5d17854cfd6d489ef3',
        nonce: '0x3',
        gas: '0x77359400',
        gasPrice: '0x77359400',
        value: '0x0',
        data: '0x0',
      };
      const invalidValues = [1, true, {}, Symbol('1')];

      Object.keys(validTxParams).forEach((key) => {
        for (const value of invalidValues) {
          const tx = {
            id: 1,
            status: TRANSACTION_STATUSES.UNAPPROVED,
            metamaskNetworkId: currentNetworkId,
            txParams: {
              ...validTxParams,
              [key]: value,
            },
          };
          expect(
            txStateManager.addTransaction.bind(txStateManager, tx),
          ).toThrow('');
          const result = txStateManager.getTransactions();
          expect(Array.isArray(result)).toStrictEqual(true);
          expect(result).toHaveLength(0);
        }
      });
    });

    it('does not override txs from other networks', () => {
      const tx = {
        id: 1,
        status: TRANSACTION_STATUSES.CONFIRMED,
        metamaskNetworkId: currentNetworkId,
        txParams: {
          to: VALID_ADDRESS,
          from: VALID_ADDRESS,
        },
      };
      const tx2 = {
        id: 2,
        status: TRANSACTION_STATUSES.CONFIRMED,
        metamaskNetworkId: otherNetworkId,
        txParams: {
          to: VALID_ADDRESS,
          from: VALID_ADDRESS,
        },
      };
      txStateManager.addTransaction(tx);
      txStateManager.addTransaction(tx2);
      const result = txStateManager.getTransactions({
        filterToCurrentNetwork: false,
      });
      const result2 = txStateManager.getTransactions();
      expect(result).toHaveLength(2);
      expect(result2).toHaveLength(1);
    });

    it('cuts off early txs beyond a limit', () => {
      const limit = txStateManager.txHistoryLimit;
      for (let i = 0; i < limit + 1; i++) {
        const tx = {
          id: i,
          time: new Date(),
          status: TRANSACTION_STATUSES.CONFIRMED,
          metamaskNetworkId: currentNetworkId,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS,
          },
        };
        txStateManager.addTransaction(tx);
      }
      const result = txStateManager.getTransactions();
      expect(result).toHaveLength(limit);
      expect(result[0].id).toStrictEqual(1);
    });

    it('cuts off early txs beyond a limit whether or not it is confirmed or rejected', () => {
      const limit = txStateManager.txHistoryLimit;
      for (let i = 0; i < limit + 1; i++) {
        const tx = {
          id: i,
          time: new Date(),
          status: TRANSACTION_STATUSES.REJECTED,
          metamaskNetworkId: currentNetworkId,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS,
          },
        };
        txStateManager.addTransaction(tx);
      }
      const result = txStateManager.getTransactions();
      expect(result).toHaveLength(limit);
      expect(result[0].id).toStrictEqual(1);
    });

    it('cuts off early txs beyond a limit but does not cut unapproved txs', () => {
      const unconfirmedTx = {
        id: 0,
        time: new Date(),
        status: TRANSACTION_STATUSES.UNAPPROVED,
        metamaskNetworkId: currentNetworkId,
        txParams: {
          to: VALID_ADDRESS,
          from: VALID_ADDRESS,
        },
      };
      txStateManager.addTransaction(unconfirmedTx);
      const limit = txStateManager.txHistoryLimit;
      for (let i = 1; i < limit + 1; i++) {
        const tx = {
          id: i,
          time: new Date(),
          status: TRANSACTION_STATUSES.CONFIRMED,
          metamaskNetworkId: currentNetworkId,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS,
          },
        };
        txStateManager.addTransaction(tx);
      }
      const result = txStateManager.getTransactions();
      expect(result).toHaveLength(limit);
      expect(result[0].id).toStrictEqual(0);
      expect(result[0].status).toStrictEqual(TRANSACTION_STATUSES.UNAPPROVED);
      expect(result[1].id).toStrictEqual(2);
    });
  });

  describe('#updateTransaction', () => {
    it('replaces the tx with the same id', () => {
      txStateManager.addTransaction({
        id: '1',
        status: TRANSACTION_STATUSES.UNAPPROVED,
        metamaskNetworkId: currentNetworkId,
        txParams: {
          to: VALID_ADDRESS,
          from: VALID_ADDRESS,
        },
      });
      txStateManager.addTransaction({
        id: '2',
        status: TRANSACTION_STATUSES.CONFIRMED,
        metamaskNetworkId: currentNetworkId,
        txParams: {
          to: VALID_ADDRESS,
          from: VALID_ADDRESS,
        },
      });
      const txMeta = txStateManager.getTransaction('1');
      txMeta.hash = 'foo';
      txStateManager.updateTransaction(txMeta);
      const result = txStateManager.getTransaction('1');
      expect(result.hash).toStrictEqual('foo');
    });

    it('throws error and does not update tx if txParams are invalid', () => {
      const validTxParams = {
        from: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc',
        to: '0x0039f22efb07a647557c7c5d17854cfd6d489ef3',
        nonce: '0x3',
        gas: '0x77359400',
        gasPrice: '0x77359400',
        value: '0x0',
        data: '0x0',
      };
      const invalidValues = [1, true, {}, Symbol('1')];

      txStateManager.addTransaction({
        id: 1,
        status: TRANSACTION_STATUSES.UNAPPROVED,
        metamaskNetworkId: currentNetworkId,
        txParams: validTxParams,
      });

      Object.keys(validTxParams).forEach((key) => {
        for (const value of invalidValues) {
          const originalTx = txStateManager.getTransaction(1);
          const newTx = {
            ...originalTx,
            txParams: {
              ...originalTx.txParams,
              [key]: value,
            },
          };
          expect(
            txStateManager.updateTransaction.bind(txStateManager, newTx),
          ).toThrow('');
          const result = txStateManager.getTransaction(1);
          expect(result).toStrictEqual(originalTx);
        }
      });
    });

    it('updates gas price and adds history items', () => {
      const originalGasPrice = '0x01';
      const desiredGasPrice = '0x02';

      const txMeta = {
        id: '1',
        status: TRANSACTION_STATUSES.UNAPPROVED,
        metamaskNetworkId: currentNetworkId,
        txParams: {
          from: VALID_ADDRESS_TWO,
          to: VALID_ADDRESS,
          gasPrice: originalGasPrice,
        },
      };

      txStateManager.addTransaction(txMeta);
      const updatedTx = txStateManager.getTransaction('1');
      // verify tx was initialized correctly
      expect(updatedTx.history).toHaveLength(1);
      expect(Array.isArray(updatedTx.history[0])).toStrictEqual(false);
      expect(updatedTx.history[0]).toStrictEqual(snapshotFromTxMeta(updatedTx));
      // modify value and updateTransaction
      updatedTx.txParams.gasPrice = desiredGasPrice;
      const before = new Date().getTime();
      txStateManager.updateTransaction(updatedTx);
      const after = new Date().getTime();
      // check updated value
      const result = txStateManager.getTransaction('1');
      expect(result.txParams.gasPrice).toStrictEqual(desiredGasPrice);
      // validate history was updated
      expect(result.history).toHaveLength(
        2,
        'two history items (initial + diff)',
      );
      expect(result.history[1]).toHaveLength(
        1,
        'two history state items (initial + diff)',
      );

      const expectedEntry = {
        op: 'replace',
        path: '/txParams/gasPrice',
        value: desiredGasPrice,
      };
      expect(result.history[1][0].op).toStrictEqual(expectedEntry.op);
      expect(result.history[1][0].path).toStrictEqual(expectedEntry.path);
      expect(result.history[1][0].value).toStrictEqual(expectedEntry.value);
      expect(
        result.history[1][0].timestamp >= before &&
          result.history[1][0].timestamp <= after,
      ).toStrictEqual(true);
    });

    it('does NOT add empty history items', () => {
      const txMeta = {
        id: '1',
        status: TRANSACTION_STATUSES.UNAPPROVED,
        metamaskNetworkId: currentNetworkId,
        txParams: {
          from: VALID_ADDRESS_TWO,
          to: VALID_ADDRESS,
          gasPrice: '0x01',
        },
      };

      txStateManager.addTransaction(txMeta);
      txStateManager.updateTransaction(txMeta);

      const { history } = txStateManager.getTransaction('1');
      expect(history).toHaveLength(1);
    });
  });

  describe('#getUnapprovedTxList', () => {
    it('returns unapproved txs in a hash', () => {
      txStateManager.addTransaction({
        id: '1',
        status: TRANSACTION_STATUSES.UNAPPROVED,
        metamaskNetworkId: currentNetworkId,
        txParams: {
          to: VALID_ADDRESS,
          from: VALID_ADDRESS,
        },
      });
      txStateManager.addTransaction({
        id: '2',
        status: TRANSACTION_STATUSES.CONFIRMED,
        metamaskNetworkId: currentNetworkId,
        txParams: {
          to: VALID_ADDRESS,
          from: VALID_ADDRESS,
        },
      });
      const result = txStateManager.getUnapprovedTxList();
      expect(typeof result).toStrictEqual('object');
      expect(result['1'].status).toStrictEqual(TRANSACTION_STATUSES.UNAPPROVED);
      expect(result['2']).toBeUndefined();
    });
  });

  describe('#getTransaction', () => {
    it('returns a tx with the requested id', () => {
      txStateManager.addTransaction({
        id: '1',
        status: TRANSACTION_STATUSES.UNAPPROVED,
        metamaskNetworkId: currentNetworkId,
        txParams: {
          to: VALID_ADDRESS,
          from: VALID_ADDRESS,
        },
      });
      txStateManager.addTransaction({
        id: '2',
        status: TRANSACTION_STATUSES.CONFIRMED,
        metamaskNetworkId: currentNetworkId,
        txParams: {
          to: VALID_ADDRESS,
          from: VALID_ADDRESS,
        },
      });
      expect(txStateManager.getTransaction('1').status).toStrictEqual(
        TRANSACTION_STATUSES.UNAPPROVED,
      );
      expect(txStateManager.getTransaction('2').status).toStrictEqual(
        TRANSACTION_STATUSES.CONFIRMED,
      );
    });
  });

  describe('#wipeTransactions', () => {
    const specificAddress = VALID_ADDRESS;
    const otherAddress = VALID_ADDRESS_TWO;

    it('should remove only the transactions from a specific address', () => {
      const txMetas = [
        {
          id: 0,
          status: TRANSACTION_STATUSES.UNAPPROVED,
          txParams: { from: specificAddress, to: otherAddress },
          metamaskNetworkId: currentNetworkId,
        },
        {
          id: 1,
          status: TRANSACTION_STATUSES.CONFIRMED,
          txParams: { from: otherAddress, to: specificAddress },
          metamaskNetworkId: currentNetworkId,
        },
        {
          id: 2,
          status: TRANSACTION_STATUSES.CONFIRMED,
          txParams: { from: otherAddress, to: specificAddress },
          metamaskNetworkId: currentNetworkId,
        },
      ];
      txMetas.forEach((txMeta) => txStateManager.addTransaction(txMeta));

      txStateManager.wipeTransactions(specificAddress);

      const transactionsFromCurrentAddress = txStateManager
        .getTransactions()
        .filter((txMeta) => txMeta.txParams.from === specificAddress);
      const transactionsFromOtherAddresses = txStateManager
        .getTransactions()
        .filter((txMeta) => txMeta.txParams.from !== specificAddress);

      expect(transactionsFromCurrentAddress).toHaveLength(0);
      expect(transactionsFromOtherAddresses).toHaveLength(2);
    });

    it('should not remove the transactions from other networks', () => {
      const txMetas = [
        {
          id: 0,
          status: TRANSACTION_STATUSES.UNAPPROVED,
          txParams: { from: specificAddress, to: otherAddress },
          metamaskNetworkId: currentNetworkId,
        },
        {
          id: 1,
          status: TRANSACTION_STATUSES.CONFIRMED,
          txParams: { from: specificAddress, to: otherAddress },
          metamaskNetworkId: otherNetworkId,
        },
        {
          id: 2,
          status: TRANSACTION_STATUSES.CONFIRMED,
          txParams: { from: specificAddress, to: otherAddress },
          metamaskNetworkId: otherNetworkId,
        },
      ];

      txMetas.forEach((txMeta) => txStateManager.addTransaction(txMeta));

      txStateManager.wipeTransactions(specificAddress);

      const txsFromCurrentNetworkAndAddress = txStateManager
        .getTransactions()
        .filter((txMeta) => txMeta.txParams.from === specificAddress);
      const txFromOtherNetworks = txStateManager
        .getTransactions({ filterToCurrentNetwork: false })
        .filter((txMeta) => txMeta.metamaskNetworkId === otherNetworkId);

      expect(txsFromCurrentNetworkAndAddress).toHaveLength(0);
      expect(txFromOtherNetworks).toHaveLength(2);
    });
  });

  describe('#_deleteTransaction', () => {
    it('should remove the transaction from the storage', () => {
      txStateManager.addTransaction({ id: 1 });
      txStateManager._deleteTransaction(1);
      expect(
        txStateManager.getTransactions({ filterToCurrentNetwork: false }),
      ).toHaveLength(0);
    });

    it('should only remove the transaction with ID 1 from the storage', () => {
      txStateManager.store.updateState({
        transactions: { 1: { id: 1 }, 2: { id: 2 } },
      });
      txStateManager._deleteTransaction(1);
      expect(
        txStateManager.getTransactions({
          filterToCurrentNetwork: false,
        })[0].id,
      ).toStrictEqual(2);
    });
  });

  describe('#clearUnapprovedTxs', () => {
    it('removes unapproved transactions', () => {
      const txMetas = [
        {
          id: 0,
          status: TRANSACTION_STATUSES.UNAPPROVED,
          txParams: { from: VALID_ADDRESS, to: VALID_ADDRESS_TWO },
          metamaskNetworkId: currentNetworkId,
        },
        {
          id: 1,
          status: TRANSACTION_STATUSES.UNAPPROVED,
          txParams: { from: VALID_ADDRESS, to: VALID_ADDRESS_TWO },
          metamaskNetworkId: currentNetworkId,
        },
        {
          id: 2,
          status: TRANSACTION_STATUSES.CONFIRMED,
          txParams: { from: VALID_ADDRESS, to: VALID_ADDRESS_TWO },
          metamaskNetworkId: otherNetworkId,
        },
        {
          id: 3,
          status: TRANSACTION_STATUSES.CONFIRMED,
          txParams: { from: VALID_ADDRESS, to: VALID_ADDRESS_TWO },
          metamaskNetworkId: otherNetworkId,
        },
      ];

      txMetas.forEach((txMeta) => txStateManager.addTransaction(txMeta));

      txStateManager.clearUnapprovedTxs();

      const unapprovedTxList = txStateManager
        .getTransactions({ filterToCurrentNetwork: false })
        .filter((tx) => tx.status === TRANSACTION_STATUSES.UNAPPROVED);

      expect(unapprovedTxList).toHaveLength(0);
    });
  });
});
