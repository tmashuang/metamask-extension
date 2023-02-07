/**
 * @jest-environment node
 */
// TODO: Ganache Console Logging and test failures
import EventEmitter from 'events';
import { toBuffer } from 'ethereumjs-util';
import { TransactionFactory } from '@ethereumjs/tx';
import { ObservableStore } from '@metamask/obs-store';

import {
  createTestProviderTools,
  getTestAccounts,
} from '../../../../test/stub/provider';
import mockEstimates from '../../../../test/data/mock-estimates.json';
import { EVENT } from '../../../../shared/constants/metametrics';
import {
  TransactionStatus,
  TransactionType,
  TransactionEnvelopeType,
  TransactionMetaMetricsEvent,
  AssetType,
  TokenStandard,
} from '../../../../shared/constants/transaction';

import { SECOND } from '../../../../shared/constants/time';
import {
  GasEstimateTypes,
  GasRecommendations,
} from '../../../../shared/constants/gas';
import { METAMASK_CONTROLLER_EVENTS } from '../../metamask-controller';
import { ORIGIN_METAMASK } from '../../../../shared/constants/app';
import { TRANSACTION_ENVELOPE_TYPE_NAMES } from '../../../../shared/lib/transactions-controller-utils';
import TransactionController from '.';

const noop = () => true;
const currentNetworkId = '5';
const currentChainId = '0x5';
const providerConfig = {
  type: 'goerli',
};
const actionId = 'DUMMY_ACTION_ID';
const VALID_ADDRESS = '0x0000000000000000000000000000000000000000';
const VALID_ADDRESS_TWO = '0x0000000000000000000000000000000000000001';

describe.skip('Transaction Controller', () => {
  let txController,
    provider,
    providerResultStub,
    fromAccount,
    fragmentExists,
    networkStore;

  beforeEach(() => {
    fragmentExists = false;
    providerResultStub = {
      // 1 gwei
      eth_gasPrice: '0x0de0b6b3a7640000',
      // by default, all accounts are external accounts (not contracts)
      eth_getCode: '0x',
    };
    provider = createTestProviderTools({
      scaffold: providerResultStub,
      networkId: currentNetworkId,
      chainId: currentNetworkId,
    }).provider;

    networkStore = new ObservableStore(currentNetworkId);

    fromAccount = getTestAccounts()[0];
    const blockTrackerStub = new EventEmitter();
    blockTrackerStub.getCurrentBlock = noop;
    blockTrackerStub.getLatestBlock = noop;
    txController = new TransactionController({
      provider,
      getGasPrice() {
        return '0xee6b2800';
      },
      getNetworkState: () => networkStore.getState(),
      onNetworkStateChange: (listener) => networkStore.subscribe(listener),
      getCurrentNetworkEIP1559Compatibility: () => Promise.resolve(false),
      getCurrentAccountEIP1559Compatibility: () => false,
      txHistoryLimit: 10,
      blockTracker: blockTrackerStub,
      signTransaction: (ethTx) =>
        new Promise((resolve) => {
          resolve(ethTx.sign(fromAccount.key));
        }),
      getProviderConfig: () => providerConfig,
      getPermittedAccounts: () => undefined,
      getCurrentChainId: () => currentChainId,
      getParticipateInMetrics: () => false,
      trackMetaMetricsEvent: () => undefined,
      createEventFragment: () => undefined,
      updateEventFragment: () => undefined,
      finalizeEventFragment: () => undefined,
      getEventFragmentById: () =>
        fragmentExists === false ? undefined : { id: 0 },
      getEIP1559GasFeeEstimates: () => undefined,
      getAccountType: () => 'MetaMask',
      getDeviceModel: () => 'N/A',
      securityProviderRequest: () => undefined,
    });
    txController.nonceTracker.getNonceLock = () =>
      Promise.resolve({ nextNonce: 0, releaseLock: noop });
  });

  describe('#getState', () => {
    it('should return a state object with the right keys and data types', () => {
      const exposedState = txController.getState();
      expect('unapprovedTxs' in exposedState).toBeTruthy();
      expect('currentNetworkTxList' in exposedState).toBeTruthy();
      expect(typeof exposedState?.unapprovedTxs === 'object').toBeTruthy();
      expect(Array.isArray(exposedState.currentNetworkTxList)).toBeTruthy();
    });
  });

  describe('#getUnapprovedTxCount', () => {
    it('should return the number of unapproved txs', () => {
      txController.txStateManager._addTransactionsToState([
        {
          id: 1,
          status: TransactionStatus.unapproved,
          metamaskNetworkId: currentNetworkId,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
          },
          history: [{}],
        },
        {
          id: 2,
          status: TransactionStatus.unapproved,
          metamaskNetworkId: currentNetworkId,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
          },
          history: [{}],
        },
        {
          id: 3,
          status: TransactionStatus.unapproved,
          metamaskNetworkId: currentNetworkId,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
          },
          history: [{}],
        },
      ]);
      const unapprovedTxCount = txController.getUnapprovedTxCount();
      expect(unapprovedTxCount).toStrictEqual(3);
    });
  });

  describe('#getPendingTxCount', () => {
    it('should return the number of pending txs', () => {
      txController.txStateManager._addTransactionsToState([
        {
          id: 1,
          status: TransactionStatus.submitted,
          metamaskNetworkId: currentNetworkId,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
          },
          history: [{}],
        },
        {
          id: 2,
          status: TransactionStatus.submitted,
          metamaskNetworkId: currentNetworkId,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
          },
          history: [{}],
        },
        {
          id: 3,
          status: TransactionStatus.submitted,
          metamaskNetworkId: currentNetworkId,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
          },
          history: [{}],
        },
      ]);
      const pendingTxCount = txController.getPendingTxCount();
      expect(pendingTxCount).toStrictEqual(3);
    });
  });

  describe('#getConfirmedTransactions', () => {
    it('should return the number of confirmed txs', () => {
      const address = '0xc684832530fcbddae4b4230a47e991ddcec2831d';
      const txParams = {
        from: address,
        to: '0xc684832530fcbddae4b4230a47e991ddcec2831d',
      };
      txController.txStateManager._addTransactionsToState([
        {
          id: 0,
          status: TransactionStatus.confirmed,
          metamaskNetworkId: currentNetworkId,
          txParams,
          history: [{}],
        },
        {
          id: 1,
          status: TransactionStatus.confirmed,
          metamaskNetworkId: currentNetworkId,
          txParams,
          history: [{}],
        },
        {
          id: 2,
          status: TransactionStatus.confirmed,
          metamaskNetworkId: currentNetworkId,
          txParams,
          history: [{}],
        },
        {
          id: 3,
          status: TransactionStatus.unapproved,
          metamaskNetworkId: currentNetworkId,
          txParams,
          history: [{}],
        },
        {
          id: 4,
          status: TransactionStatus.rejected,
          metamaskNetworkId: currentNetworkId,
          txParams,
          history: [{}],
        },
        {
          id: 5,
          status: TransactionStatus.approved,
          metamaskNetworkId: currentNetworkId,
          txParams,
          history: [{}],
        },
        {
          id: 6,
          status: TransactionStatus.signed,
          metamaskNetworkId: currentNetworkId,
          txParams,
          history: [{}],
        },
        {
          id: 7,
          status: TransactionStatus.submitted,
          metamaskNetworkId: currentNetworkId,
          txParams,
          history: [{}],
        },
        {
          id: 8,
          status: TransactionStatus.failed,
          metamaskNetworkId: currentNetworkId,
          txParams,
          history: [{}],
        },
      ]);
      expect(
        txController.nonceTracker.getConfirmedTransactions(address),
      ).toHaveLength(3);
    });
  });

  describe('#newUnapprovedTransaction', () => {
    let stub, txMeta, txParams;
    beforeEach(() => {
      txParams = {
        from: '0xc684832530fcbddae4b4230a47e991ddcec2831d',
        to: '0xc684832530fcbddae4b4230a47e991ddcec2831d',
      };
      txMeta = {
        status: TransactionStatus.unapproved,
        id: 1,
        metamaskNetworkId: currentNetworkId,
        txParams,
        history: [{}],
      };
      txController.txStateManager._addTransactionsToState([txMeta]);
      stub = jest
        .spyOn(txController, 'addUnapprovedTransaction')
        .mockClear()
        .mockImplementation()
        .callsFake(() => {
          txController.emit('newUnapprovedTx', txMeta);
          return Promise.resolve(
            txController.txStateManager.addTransaction(txMeta),
          );
        });
    });

    afterEach(() => {
      txController.txStateManager._addTransactionsToState([]);
      stub.mockRestore();
    });

    it('should resolve when finished and status is submitted and resolve with the hash', async () => {
      txController.once('newUnapprovedTx', (txMetaFromEmit) => {
        setTimeout(() => {
          txController.setTxHash(txMetaFromEmit.id, '0x0');
          txController.txStateManager.setTxStatusSubmitted(txMetaFromEmit.id);
        });
      });

      const hash = await txController.newUnapprovedTransaction(txParams);
      expect(hash).toBeTruthy();
    });

    it('should reject when finished and status is rejected', async () => {
      txController.once('newUnapprovedTx', (txMetaFromEmit) => {
        setTimeout(() => {
          txController.txStateManager.setTxStatusRejected(txMetaFromEmit.id);
        });
      });

      // await assert.rejects(
      //   () => txController.newUnapprovedTransaction(txParams),
      //   {
      //     message: 'MetaMask Tx Signature: User denied transaction signature.',
      //   },
      // );
      await expect(() =>
        txController.newUnapprovedTransaction(txParams),
      ).rejects.toThrow('a');
    });
  });

  describe('#addUnapprovedTransaction', () => {
    const selectedAddress = '0x1678a085c290ebd122dc42cba69373b5953b831d';
    const recipientAddress = '0xc42edfcc21ed14dda456aa0756c153f7985d8813';

    let getSelectedAddress, getPermittedAccounts, getDefaultGasFees;
    beforeEach(() => {
      getSelectedAddress = jest
        .spyOn(txController, 'getSelectedAddress')
        .mockClear()
        .mockReturnValue(selectedAddress);
      getDefaultGasFees = jest
        .spyOn(txController, '_getDefaultGasFees')
        .mockClear()
        .mockReturnValue({});
      getPermittedAccounts = jest
        .spyOn(txController, 'getPermittedAccounts')
        .mockClear()
        .mockReturnValue([selectedAddress]);
    });

    afterEach(() => {
      getSelectedAddress.mockRestore();
      getPermittedAccounts.mockRestore();
      getDefaultGasFees.mockRestore();
    });

    it('should add an unapproved transaction and return a valid txMeta', async () => {
      const txMeta = await txController.addUnapprovedTransaction({
        from: selectedAddress,
        to: recipientAddress,
      });
      expect('id' in txMeta).toBeTruthy();
      expect('time' in txMeta).toBeTruthy();
      expect('metamaskNetworkId' in txMeta).toBeTruthy();
      expect('txParams' in txMeta).toBeTruthy();
      expect('history' in txMeta).toBeTruthy();
      expect(txMeta.txParams.value).toStrictEqual('0x0');

      const memTxMeta = txController.txStateManager.getTransaction(txMeta.id);
      expect(txMeta).toStrictEqual(memTxMeta);
    });

    it('should add only 1 unapproved transaction when called twice with same actionId', async () => {
      await txController.addUnapprovedTransaction(
        undefined,
        {
          from: selectedAddress,
          to: recipientAddress,
        },
        undefined,
        undefined,
        undefined,
        '12345',
      );
      const transactionCount1 =
        txController.txStateManager.getTransactions().length;
      await txController.addUnapprovedTransaction(
        undefined,
        {
          from: selectedAddress,
          to: recipientAddress,
        },
        undefined,
        undefined,
        undefined,
        '12345',
      );
      const transactionCount2 =
        txController.txStateManager.getTransactions().length;
      expect(transactionCount1).toStrictEqual(transactionCount2);
    });

    it('should add multiple transactions when called with different actionId', async () => {
      await txController.addUnapprovedTransaction(
        undefined,
        {
          from: selectedAddress,
          to: recipientAddress,
        },
        undefined,
        undefined,
        undefined,
        '12345',
      );
      const transactionCount1 =
        txController.txStateManager.getTransactions().length;
      await txController.addUnapprovedTransaction(
        undefined,
        {
          from: selectedAddress,
          to: recipientAddress,
        },
        undefined,
        undefined,
        undefined,
        '00000',
      );
      const transactionCount2 =
        txController.txStateManager.getTransactions().length;
      expect(transactionCount1 + 1).toStrictEqual(transactionCount2);
    });

    it('should emit newUnapprovedTx event and pass txMeta as the first argument', (done) => {
      providerResultStub.eth_gasPrice = '4a817c800';
      txController.once('newUnapprovedTx', (txMetaFromEmit) => {
        expect(txMetaFromEmit).toBeTruthy();
        done();
      });
      txController
        .addUnapprovedTransaction(undefined, {
          from: selectedAddress,
          to: recipientAddress,
        })
        .catch(done);
    });

    it("should fail if the from address isn't the selected address", async () => {
      // await assert.rejects(() =>
      //   txController.addUnapprovedTransaction({
      //     from: '0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2',
      //   }),
      // );
      await expect(() =>
        txController.addUnapprovedTransaction({
          from: '0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2',
        }),
      ).rejects.toThrow('as');
    });

    it('should fail if netId is loading', async () => {
      networkStore.putState('loading');
      // await assert.rejects(
      //   () =>
      //     txController.addUnapprovedTransaction({
      //       from: selectedAddress,
      //       to: '0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2',
      //     }),
      //   { message: 'MetaMask is having trouble connecting to the network' },
      // );
      await expect(() =>
        txController.addUnapprovedTransaction({
          from: selectedAddress,
          to: '0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2',
        }),
      ).rejects.toThrow('asd');
    });
  });

  describe('#createCancelTransaction', () => {
    const selectedAddress = '0x1678a085c290ebd122dc42cba69373b5953b831d';
    const recipientAddress = '0xc42edfcc21ed14dda456aa0756c153f7985d8813';

    let getSelectedAddress,
      getPermittedAccounts,
      getDefaultGasFees,
      getDefaultGasLimit;
    beforeEach(() => {
      const hash =
        '0x2a5523c6fa98b47b7d9b6c8320179785150b42a16bcff36b398c5062b65657e8';
      providerResultStub.eth_sendRawTransaction = hash;

      getSelectedAddress = jest
        .spyOn(txController, 'getSelectedAddress')
        .mockClear()
        .mockReturnValue(selectedAddress);
      getDefaultGasFees = jest
        .spyOn(txController, '_getDefaultGasFees')
        .mockClear()
        .mockReturnValue({});
      getDefaultGasLimit = jest
        .spyOn(txController, '_getDefaultGasLimit')
        .mockClear()
        .mockReturnValue({});
      getPermittedAccounts = jest
        .spyOn(txController, 'getPermittedAccounts')
        .mockClear()
        .mockReturnValue([selectedAddress]);
    });

    afterEach(() => {
      getSelectedAddress.mockRestore();
      getPermittedAccounts.mockRestore();
      getDefaultGasFees.mockRestore();
      getDefaultGasLimit.mockRestore();
    });

    it('should add an cancel transaction and return a valid txMeta', async () => {
      const txMeta = await txController.addUnapprovedTransaction({
        from: selectedAddress,
        to: recipientAddress,
      });
      await txController.approveTransaction(txMeta.id);
      const cancelTxMeta = await txController.createCancelTransaction(
        txMeta.id,
        {},
        { actionId: 12345 },
      );
      expect(cancelTxMeta.type).toStrictEqual(TransactionType.cancel);
      const memTxMeta = txController.txStateManager.getTransaction(
        cancelTxMeta.id,
      );
      expect(cancelTxMeta).toStrictEqual(memTxMeta);
    });

    it('should add only 1 cancel transaction when called twice with same actionId', async () => {
      const txMeta = await txController.addUnapprovedTransaction({
        from: selectedAddress,
        to: recipientAddress,
      });
      await txController.approveTransaction(txMeta.id);
      await txController.createCancelTransaction(
        txMeta.id,
        {},
        { actionId: 12345 },
      );
      const transactionCount1 =
        txController.txStateManager.getTransactions().length;
      await txController.createCancelTransaction(
        txMeta.id,
        {},
        { actionId: 12345 },
      );
      const transactionCount2 =
        txController.txStateManager.getTransactions().length;
      expect(transactionCount1).toStrictEqual(transactionCount2);
    });

    it('should add multiple transactions when called with different actionId', async () => {
      const txMeta = await txController.addUnapprovedTransaction({
        from: selectedAddress,
        to: recipientAddress,
      });
      await txController.approveTransaction(txMeta.id);
      await txController.createCancelTransaction(
        txMeta.id,
        {},
        { actionId: 12345 },
      );
      const transactionCount1 =
        txController.txStateManager.getTransactions().length;
      await txController.createCancelTransaction(
        txMeta.id,
        {},
        { actionId: 11111 },
      );
      const transactionCount2 =
        txController.txStateManager.getTransactions().length;
      expect(transactionCount1 + 1).toStrictEqual(transactionCount2);
    });
  });

  describe('#addTxGasDefaults', () => {
    it('should add the tx defaults if their are none', async () => {
      txController.txStateManager._addTransactionsToState([
        {
          id: 1,
          status: TransactionStatus.unapproved,
          metamaskNetworkId: currentNetworkId,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
          },
          history: [{}],
        },
      ]);
      const txMeta = {
        id: 1,
        txParams: {
          from: '0xc684832530fcbddae4b4230a47e991ddcec2831d',
          to: '0xc684832530fcbddae4b4230a47e991ddcec2831d',
        },
        history: [{}],
      };
      providerResultStub.eth_gasPrice = '4a817c800';
      providerResultStub.eth_getBlockByNumber = { gasLimit: '47b784' };
      providerResultStub.eth_estimateGas = '5209';

      const txMetaWithDefaults = await txController.addTxGasDefaults(txMeta);
      expect(txMetaWithDefaults.txParams.gasPrice).toBeTruthy();
      expect(txMetaWithDefaults.txParams.gas).toBeTruthy();
    });

    it('should add EIP1559 tx defaults', async () => {
      const TEST_MAX_FEE_PER_GAS = '0x12a05f200';
      const TEST_MAX_PRIORITY_FEE_PER_GAS = '0x77359400';

      const stub1 = jest
        .spyOn(txController, 'getEIP1559Compatibility')
        .mockClear()
        .mockReturnValue(true);

      const stub2 = jest
        .spyOn(txController, '_getDefaultGasFees')
        .mockClear()
        .mockImplementation()
        .callsFake(() => ({
          maxFeePerGas: TEST_MAX_FEE_PER_GAS,
          maxPriorityFeePerGas: TEST_MAX_PRIORITY_FEE_PER_GAS,
        }));

      txController.txStateManager._addTransactionsToState([
        {
          id: 1,
          status: TransactionStatus.unapproved,
          metamaskNetworkId: currentNetworkId,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
          },
          history: [{}],
        },
      ]);
      const txMeta = {
        id: 1,
        txParams: {
          from: '0xc684832530fcbddae4b4230a47e991ddcec2831d',
          to: '0xc684832530fcbddae4b4230a47e991ddcec2831d',
        },
        history: [{}],
      };
      providerResultStub.eth_getBlockByNumber = { gasLimit: '47b784' };
      providerResultStub.eth_estimateGas = '5209';

      const txMetaWithDefaults = await txController.addTxGasDefaults(txMeta);

      expect(txMetaWithDefaults.txParams.maxFeePerGas).toStrictEqual(
        TEST_MAX_FEE_PER_GAS,
      );
      expect(txMetaWithDefaults.txParams.maxPriorityFeePerGas).toStrictEqual(
        TEST_MAX_PRIORITY_FEE_PER_GAS,
      );
      stub1.mockRestore();
      stub2.mockRestore();
    });

    it('should add gasPrice as maxFeePerGas and maxPriorityFeePerGas if there are no sources of other fee data available', async () => {
      const TEST_GASPRICE = '0x12a05f200';

      const stub1 = jest
        .spyOn(txController, 'getEIP1559Compatibility')
        .mockClear()
        .mockReturnValue(true);

      const stub2 = jest
        .spyOn(txController, '_getDefaultGasFees')
        .mockClear()
        .mockImplementation()
        .callsFake(() => ({ gasPrice: TEST_GASPRICE }));

      txController.txStateManager._addTransactionsToState([
        {
          id: 1,
          status: TransactionStatus.unapproved,
          metamaskNetworkId: currentNetworkId,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
          },
          history: [{}],
        },
      ]);
      const txMeta = {
        id: 1,
        txParams: {
          from: '0xc684832530fcbddae4b4230a47e991ddcec2831d',
          to: '0xc684832530fcbddae4b4230a47e991ddcec2831d',
        },
        history: [{}],
      };
      providerResultStub.eth_getBlockByNumber = { gasLimit: '47b784' };
      providerResultStub.eth_estimateGas = '5209';

      const txMetaWithDefaults = await txController.addTxGasDefaults(txMeta);

      expect(txMetaWithDefaults.txParams.maxFeePerGas).toStrictEqual(
        TEST_GASPRICE,
      );
      expect(txMetaWithDefaults.txParams.maxPriorityFeePerGas).toStrictEqual(
        TEST_GASPRICE,
      );
      stub1.mockRestore();
      stub2.mockRestore();
    });

    it('should not add maxFeePerGas and maxPriorityFeePerGas to type-0 transactions', async () => {
      const TEST_GASPRICE = '0x12a05f200';

      const stub1 = jest
        .spyOn(txController, 'getEIP1559Compatibility')
        .mockClear()
        .mockReturnValue(true);

      const stub2 = jest
        .spyOn(txController, '_getDefaultGasFees')
        .mockClear()
        .mockImplementation()
        .callsFake(() => ({ gasPrice: TEST_GASPRICE }));

      txController.txStateManager._addTransactionsToState([
        {
          id: 1,
          status: TransactionStatus.unapproved,
          metamaskNetworkId: currentNetworkId,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
            type: TransactionEnvelopeType.legacy,
          },
          history: [{}],
        },
      ]);
      const txMeta = {
        id: 1,
        txParams: {
          from: '0xc684832530fcbddae4b4230a47e991ddcec2831d',
          to: '0xc684832530fcbddae4b4230a47e991ddcec2831d',
          type: TransactionEnvelopeType.legacy,
        },
        history: [{}],
      };
      providerResultStub.eth_getBlockByNumber = { gasLimit: '47b784' };
      providerResultStub.eth_estimateGas = '5209';

      const txMetaWithDefaults = await txController.addTxGasDefaults(txMeta);

      expect(txMetaWithDefaults.txParams.maxFeePerGas).toStrictEqual(undefined);
      expect(txMetaWithDefaults.txParams.maxPriorityFeePerGas).toStrictEqual(
        undefined,
      );
      stub1.mockRestore();
      stub2.mockRestore();
    });

    it('should not add gasPrice if the fee data is available from the dapp', async () => {
      const TEST_GASPRICE = '0x12a05f200';
      const TEST_MAX_FEE_PER_GAS = '0x12a05f200';
      const TEST_MAX_PRIORITY_FEE_PER_GAS = '0x77359400';

      const stub1 = jest
        .spyOn(txController, 'getEIP1559Compatibility')
        .mockClear()
        .mockReturnValue(true);

      const stub2 = jest
        .spyOn(txController, '_getDefaultGasFees')
        .mockClear()
        .mockImplementation()
        .callsFake(() => ({ gasPrice: TEST_GASPRICE }));

      txController.txStateManager._addTransactionsToState([
        {
          id: 1,
          status: TransactionStatus.unapproved,
          metamaskNetworkId: currentNetworkId,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
            maxFeePerGas: TEST_MAX_FEE_PER_GAS,
            maxPriorityFeePerGas: TEST_MAX_PRIORITY_FEE_PER_GAS,
          },
          history: [{}],
        },
      ]);
      const txMeta = {
        id: 1,
        txParams: {
          from: '0xc684832530fcbddae4b4230a47e991ddcec2831d',
          to: '0xc684832530fcbddae4b4230a47e991ddcec2831d',
        },
        history: [{}],
      };
      providerResultStub.eth_getBlockByNumber = { gasLimit: '47b784' };
      providerResultStub.eth_estimateGas = '5209';

      const txMetaWithDefaults = await txController.addTxGasDefaults(txMeta);

      expect(txMetaWithDefaults.txParams.maxFeePerGas).toStrictEqual(
        TEST_MAX_FEE_PER_GAS,
      );
      expect(txMetaWithDefaults.txParams.maxPriorityFeePerGas).toStrictEqual(
        TEST_MAX_PRIORITY_FEE_PER_GAS,
      );
      stub1.mockRestore();
      stub2.mockRestore();
    });
  });

  describe('_getDefaultGasFees', () => {
    let getGasFeeStub;

    beforeEach(() => {
      getGasFeeStub = jest
        .spyOn(txController, '_getEIP1559GasFeeEstimates')
        .mockClear()
        .mockImplementation();
    });

    afterEach(() => {
      getGasFeeStub.mockRestore();
    });

    it('should return the correct fee data when the gas estimate type is FEE_MARKET', async () => {
      const EXPECTED_MAX_FEE_PER_GAS = '12a05f200';
      const EXPECTED_MAX_PRIORITY_FEE_PER_GAS = '77359400';

      getGasFeeStub.callsFake(() => ({
        gasFeeEstimates: {
          medium: {
            suggestedMaxPriorityFeePerGas: '2',
            suggestedMaxFeePerGas: '5',
          },
        },
        gasEstimateType: GasEstimateTypes.feeMarket,
      }));

      const defaultGasFees = await txController._getDefaultGasFees(
        { txParams: {} },
        true,
      );

      expect(defaultGasFees).toStrictEqual({
        maxPriorityFeePerGas: EXPECTED_MAX_PRIORITY_FEE_PER_GAS,
        maxFeePerGas: EXPECTED_MAX_FEE_PER_GAS,
      });
    });

    it('should return the correct fee data when the gas estimate type is LEGACY', async () => {
      const EXPECTED_GAS_PRICE = '77359400';

      getGasFeeStub.callsFake(() => ({
        gasFeeEstimates: { medium: '2' },
        gasEstimateType: GasEstimateTypes.legacy,
      }));

      const defaultGasFees = await txController._getDefaultGasFees(
        { txParams: {} },
        false,
      );

      expect(defaultGasFees).toStrictEqual({
        gasPrice: EXPECTED_GAS_PRICE,
      });
    });

    it('should return the correct fee data when the gas estimate type is ETH_GASPRICE', async () => {
      const EXPECTED_GAS_PRICE = '77359400';

      getGasFeeStub.callsFake(() => ({
        gasFeeEstimates: { gasPrice: '2' },
        gasEstimateType: GasEstimateTypes.ethGasPrice,
      }));

      const defaultGasFees = await txController._getDefaultGasFees(
        { txParams: {} },
        false,
      );

      expect(defaultGasFees).toStrictEqual({
        gasPrice: EXPECTED_GAS_PRICE,
      });
    });
  });

  describe('#addTransaction', () => {
    let trackTransactionMetricsEventSpy;

    beforeEach(() => {
      trackTransactionMetricsEventSpy = jest
        .spyOn(txController, '_trackTransactionMetricsEvent')
        .mockClear();
    });

    afterEach(() => {
      trackTransactionMetricsEventSpy.mockRestore();
    });

    it('should emit updates', (done) => {
      const txMeta = {
        id: '1',
        status: TransactionStatus.unapproved,
        metamaskNetworkId: currentNetworkId,
        txParams: {
          to: VALID_ADDRESS,
          from: VALID_ADDRESS_TWO,
        },
      };

      const eventNames = [
        METAMASK_CONTROLLER_EVENTS.UPDATE_BADGE,
        '1:unapproved',
      ];
      const listeners = [];
      eventNames.forEach((eventName) => {
        listeners.push(
          new Promise((resolve) => {
            txController.once(eventName, (arg) => {
              resolve(arg);
            });
          }),
        );
      });
      Promise.all(listeners)
        .then((returnValues) => {
          expect(returnValues.pop()).toStrictEqual(txMeta);
          done();
        })
        .catch(done);
      txController.addTransaction(txMeta);
    });

    it('should call _trackTransactionMetricsEvent with the correct params', () => {
      const txMeta = {
        id: 1,
        status: TransactionStatus.unapproved,
        txParams: {
          from: fromAccount.address,
          to: '0x1678a085c290ebd122dc42cba69373b5953b831d',
          gasPrice: '0x77359400',
          gas: '0x7b0d',
          nonce: '0x4b',
        },
        type: TransactionType.simpleSend,
        transaction_envelope_type: TRANSACTION_ENVELOPE_TYPE_NAMES.LEGACY,
        origin: ORIGIN_METAMASK,
        chainId: currentChainId,
        time: 1624408066355,
        metamaskNetworkId: currentNetworkId,
      };

      txController.addTransaction(txMeta);

      expect(trackTransactionMetricsEventSpy).toHaveBeenCalledTimes(1);
      expect(trackTransactionMetricsEventSpy.mock.calls[0][0]).toStrictEqual(
        txMeta,
      );
      expect(trackTransactionMetricsEventSpy.mock.calls[0][1]).toStrictEqual(
        TransactionMetaMetricsEvent.added,
      );
    });
  });

  describe('#approveTransaction', () => {
    it('does not overwrite set values', async () => {
      const originalValue = '0x01';
      const txMeta = {
        id: '1',
        status: TransactionStatus.unapproved,
        metamaskNetworkId: currentNetworkId,
        txParams: {
          to: VALID_ADDRESS_TWO,
          from: VALID_ADDRESS,
          nonce: originalValue,
          gas: originalValue,
          gasPrice: originalValue,
        },
      };
      // eslint-disable-next-line @babel/no-invalid-this
      this.timeout(SECOND * 15);
      const wrongValue = '0x05';

      txController.addTransaction(txMeta);
      providerResultStub.eth_gasPrice = wrongValue;
      providerResultStub.eth_estimateGas = '0x5209';

      const signStub = jest
        .spyOn(txController, 'signTransaction')
        .mockClear()
        .mockImplementation()
        .callsFake(() => Promise.resolve());

      const pubStub = jest
        .spyOn(txController, 'publishTransaction')
        .mockClear()
        .mockImplementation()
        .callsFake(() => {
          txController.setTxHash('1', originalValue);
          txController.txStateManager.setTxStatusSubmitted('1');
        });

      await txController.approveTransaction(txMeta.id);
      const result = txController.txStateManager.getTransaction(txMeta.id);
      const params = result.txParams;

      expect(params.gas).toStrictEqual(originalValue);
      expect(params.gasPrice).toStrictEqual(originalValue);
      expect(result.hash).toStrictEqual(originalValue);
      expect(result.status).toStrictEqual(TransactionStatus.submitted);
      signStub.mockRestore();
      pubStub.mockRestore();
    });
  });

  describe('#sign replay-protected tx', () => {
    it('prepares a tx with the chainId set', async () => {
      txController.addTransaction(
        {
          id: '1',
          status: TransactionStatus.unapproved,
          metamaskNetworkId: currentNetworkId,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
          },
        },
        noop,
      );
      const rawTx = await txController.signTransaction('1');
      const ethTx = TransactionFactory.fromSerializedData(toBuffer(rawTx));
      expect(ethTx.common.chainIdBN().toNumber()).toStrictEqual(5);
    });
  });

  describe('#updateAndApproveTransaction', () => {
    it('should update and approve transactions', async () => {
      const txMeta = {
        id: 1,
        status: TransactionStatus.unapproved,
        txParams: {
          from: fromAccount.address,
          to: '0x1678a085c290ebd122dc42cba69373b5953b831d',
          gasPrice: '0x77359400',
          gas: '0x7b0d',
          nonce: '0x4b',
        },
        metamaskNetworkId: currentNetworkId,
      };
      txController.txStateManager.addTransaction(txMeta);
      const approvalPromise = txController.updateAndApproveTransaction(txMeta);
      const tx = txController.txStateManager.getTransaction(1);
      expect(tx.status).toStrictEqual(TransactionStatus.approved);
      await approvalPromise;
    });
  });

  describe('#getChainId', () => {
    it('returns 0 when the chainId is NaN', () => {
      networkStore.putState('loading');
      expect(txController.getChainId()).toStrictEqual(0);
    });
  });

  describe('#cancelTransaction', () => {
    it('should emit a status change to rejected', (done) => {
      txController.txStateManager._addTransactionsToState([
        {
          id: 0,
          status: TransactionStatus.unapproved,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
          },
          metamaskNetworkId: currentNetworkId,
          history: [{}],
        },
        {
          id: 1,
          status: TransactionStatus.rejected,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
          },
          metamaskNetworkId: currentNetworkId,
          history: [{}],
        },
        {
          id: 2,
          status: TransactionStatus.approved,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
          },
          metamaskNetworkId: currentNetworkId,
          history: [{}],
        },
        {
          id: 3,
          status: TransactionStatus.signed,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
          },
          metamaskNetworkId: currentNetworkId,
          history: [{}],
        },
        {
          id: 4,
          status: TransactionStatus.submitted,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
          },
          metamaskNetworkId: currentNetworkId,
          history: [{}],
        },
        {
          id: 5,
          status: TransactionStatus.confirmed,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
          },
          metamaskNetworkId: currentNetworkId,
          history: [{}],
        },
        {
          id: 6,
          status: TransactionStatus.failed,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
          },
          metamaskNetworkId: currentNetworkId,
          history: [{}],
        },
      ]);

      txController.once('tx:status-update', (txId, status) => {
        try {
          expect(status).toStrictEqual(TransactionStatus.rejected);
          expect(txId).toStrictEqual(0);
          done();
        } catch (e) {
          done(e);
        }
      });

      txController.cancelTransaction(0);
    });
  });

  describe('#createSpeedUpTransaction', () => {
    let addTransactionSpy;
    let approveTransactionSpy;
    let txParams;
    let expectedTxParams;
    const selectedAddress = '0x1678a085c290ebd122dc42cba69373b5953b831d';
    const recipientAddress = '0xc42edfcc21ed14dda456aa0756c153f7985d8813';

    let getSelectedAddress,
      getPermittedAccounts,
      getDefaultGasFees,
      getDefaultGasLimit;

    beforeEach(() => {
      addTransactionSpy = jest
        .spyOn(txController, 'addTransaction')
        .mockClear();
      approveTransactionSpy = jest
        .spyOn(txController, 'approveTransaction')
        .mockClear();

      const hash =
        '0x2a5523c6fa98b47b7d9b6c8320179785150b42a16bcff36b398c5062b65657e8';
      providerResultStub.eth_sendRawTransaction = hash;

      getSelectedAddress = jest
        .spyOn(txController, 'getSelectedAddress')
        .mockClear()
        .mockReturnValue(selectedAddress);
      getDefaultGasFees = jest
        .spyOn(txController, '_getDefaultGasFees')
        .mockClear()
        .mockReturnValue({});
      getDefaultGasLimit = jest
        .spyOn(txController, '_getDefaultGasLimit')
        .mockClear()
        .mockReturnValue({});
      getPermittedAccounts = jest
        .spyOn(txController, 'getPermittedAccounts')
        .mockClear()
        .mockReturnValue([selectedAddress]);

      txParams = {
        nonce: '0x00',
        from: '0xB09d8505E1F4EF1CeA089D47094f5DD3464083d4',
        to: '0xB09d8505E1F4EF1CeA089D47094f5DD3464083d4',
        gas: '0x5209',
        gasPrice: '0xa',
        estimateSuggested: GasRecommendations.medium,
        estimateUsed: GasRecommendations.high,
      };
      txController.txStateManager._addTransactionsToState([
        {
          id: 1,
          status: TransactionStatus.submitted,
          metamaskNetworkId: currentNetworkId,
          txParams,
          history: [{}],
        },
      ]);

      expectedTxParams = { ...txParams, gasPrice: '0xb' };
    });

    afterEach(() => {
      addTransactionSpy.mockRestore();
      approveTransactionSpy.mockRestore();
      getSelectedAddress.mockRestore();
      getPermittedAccounts.mockRestore();
      getDefaultGasFees.mockRestore();
      getDefaultGasLimit.mockRestore();
    });

    it('should call this.addTransaction and this.approveTransaction with the expected args', async () => {
      await txController.createSpeedUpTransaction(1);
      expect(addTransactionSpy).toHaveBeenCalledTimes(1);

      const addTransactionArgs = addTransactionSpy.mock.calls[0][0];
      expect(addTransactionArgs.txParams).toStrictEqual(expectedTxParams);

      const { previousGasParams, type } = addTransactionArgs;
      expect({ gasPrice: previousGasParams.gasPrice, type }).toStrictEqual({
        gasPrice: '0xa',
        type: TTransactionType.retry,
      });
    });

    it('should call this.approveTransaction with the id of the returned tx', async () => {
      const result = await txController.createSpeedUpTransaction(1);
      expect(approveTransactionSpy).toHaveBeenCalledTimes(1);

      const approveTransactionArg = approveTransactionSpy.mock.calls[0][0];
      expect(result.id).toStrictEqual(approveTransactionArg);
    });

    it('should return the expected txMeta', async () => {
      const result = await txController.createSpeedUpTransaction(1);

      expect(result.txParams).toStrictEqual(expectedTxParams);

      const { previousGasParams, type } = result;
      expect({ gasPrice: previousGasParams.gasPrice, type }).toStrictEqual({
        gasPrice: '0xa',
        type: TransactionType.retry,
      });
    });

    it('should add only 1 speedup transaction when called twice with same actionId', async () => {
      const txMeta = await txController.addUnapprovedTransaction({
        from: selectedAddress,
        to: recipientAddress,
      });
      await txController.approveTransaction(txMeta.id);
      await txController.createSpeedUpTransaction(
        txMeta.id,
        {},
        { actionId: 12345 },
      );
      const transactionCount1 =
        txController.txStateManager.getTransactions().length;
      await txController.createSpeedUpTransaction(
        txMeta.id,
        {},
        { actionId: 12345 },
      );
      const transactionCount2 =
        txController.txStateManager.getTransactions().length;
      expect(transactionCount1).toStrictEqual(transactionCount2);
    });

    it('should add multiple transactions when called with different actionId', async () => {
      const txMeta = await txController.addUnapprovedTransaction({
        from: selectedAddress,
        to: recipientAddress,
      });
      await txController.approveTransaction(txMeta.id);
      await txController.createSpeedUpTransaction(
        txMeta.id,
        {},
        { actionId: 12345 },
      );
      const transactionCount1 =
        txController.txStateManager.getTransactions().length;
      await txController.createSpeedUpTransaction(
        txMeta.id,
        {},
        { actionId: 11111 },
      );
      const transactionCount2 =
        txController.txStateManager.getTransactions().length;
      expect(transactionCount1 + 1).toStrictEqual(transactionCount2);
    });

    it('should add multiple transactions when called with different actionId and txMethodType defined', async function () {
      const txMeta = await txController.addUnapprovedTransaction(
        'eth_sendTransaction',
        {
          from: selectedAddress,
          to: recipientAddress,
        },
      );
      await txController.approveTransaction(txMeta.id);
      await txController.createSpeedUpTransaction(
        txMeta.id,
        {},
        { actionId: 12345 },
      );
      const transactionCount1 =
        txController.txStateManager.getTransactions().length;
      await txController.createSpeedUpTransaction(
        txMeta.id,
        {},
        { actionId: 11111 },
      );
      const transactionCount2 =
        txController.txStateManager.getTransactions().length;
      assert.equal(transactionCount1 + 1, transactionCount2);
    });

    it('should call securityProviderRequest and have flagAsDangerous inside txMeta', async function () {
      const txMeta = await txController.addUnapprovedTransaction(
        'eth_sendTransaction',
        {
          from: selectedAddress,
          to: recipientAddress,
        },
      );

      assert.ok(
        'securityProviderResponse' in txMeta,
        'should have a securityProviderResponse',
      );
    });
  });

  describe('#signTransaction', () => {
    let fromTxDataSpy;

    beforeEach(() => {
      fromTxDataSpy = jest.spyOn(TransactionFactory, 'fromTxData').mockClear();
    });

    afterEach(() => {
      fromTxDataSpy.mockRestore();
    });

    it('sets txParams.type to 0x0 (non-EIP-1559)', async () => {
      txController.txStateManager._addTransactionsToState([
        {
          status: TransactionStatus.unapproved,
          id: 1,
          metamaskNetworkId: currentNetworkId,
          history: [{}],
          txParams: {
            from: VALID_ADDRESS_TWO,
            to: VALID_ADDRESS,
            gasPrice: '0x77359400',
            gas: '0x7b0d',
            nonce: '0x4b',
          },
        },
      ]);
      await txController.signTransaction('1');
      expect(fromTxDataSpy.mock.calls[0][0].type).toStrictEqual('0x0');
    });

    it('sets txParams.type to 0x2 (EIP-1559)', async () => {
      const eip1559CompatibilityStub = jest
        .spyOn(txController, 'getEIP1559Compatibility')
        .mockClear()
        .mockReturnValue(true);
      txController.txStateManager._addTransactionsToState([
        {
          status: TransactionStatus.unapproved,
          id: 2,
          metamaskNetworkId: currentNetworkId,
          history: [{}],
          txParams: {
            from: VALID_ADDRESS_TWO,
            to: VALID_ADDRESS,
            maxFeePerGas: '0x77359400',
            maxPriorityFeePerGas: '0x77359400',
            gas: '0x7b0d',
            nonce: '0x4b',
          },
        },
      ]);
      await txController.signTransaction('2');
      expect(fromTxDataSpy.mock.calls[0][0].type).toStrictEqual('0x2');
      eip1559CompatibilityStub.mockRestore();
    });
  });

  describe('#publishTransaction', () => {
    let hash, txMeta, trackTransactionMetricsEventSpy;

    beforeEach(() => {
      hash =
        '0x2a5523c6fa98b47b7d9b6c8320179785150b42a16bcff36b398c5062b65657e8';
      txMeta = {
        id: 1,
        status: TransactionStatus.unapproved,
        txParams: {
          gas: '0x7b0d',
          to: VALID_ADDRESS,
          from: VALID_ADDRESS_TWO,
        },
        metamaskNetworkId: currentNetworkId,
      };
      providerResultStub.eth_sendRawTransaction = hash;
      trackTransactionMetricsEventSpy = jest
        .spyOn(txController, '_trackTransactionMetricsEvent')
        .mockClear();
    });

    afterEach(() => {
      trackTransactionMetricsEventSpy.mockRestore();
    });

    it('should publish a tx, updates the rawTx when provided a one', async () => {
      const rawTx =
        '0x477b2e6553c917af0db0388ae3da62965ff1a184558f61b749d1266b2e6d024c';
      txController.txStateManager.addTransaction(txMeta);
      await txController.publishTransaction(txMeta.id, rawTx);
      const publishedTx = txController.txStateManager.getTransaction(1);
      expect(publishedTx.hash).toStrictEqual(hash);
      expect(publishedTx.status).toStrictEqual(TransactionStatus.submitted);
    });

    it('should ignore the error "Transaction Failed: known transaction" and be as usual', async () => {
      providerResultStub.eth_sendRawTransaction = async (_, __, ___, end) => {
        end('Transaction Failed: known transaction');
      };
      const rawTx =
        '0xf86204831e848082520894f231d46dd78806e1dd93442cf33c7671f853874880802ca05f973e540f2d3c2f06d3725a626b75247593cb36477187ae07ecfe0a4db3cf57a00259b52ee8c58baaa385fb05c3f96116e58de89bcc165cb3bfdfc708672fed8a';
      txController.txStateManager.addTransaction(txMeta);
      await txController.publishTransaction(txMeta.id, rawTx);
      const publishedTx = txController.txStateManager.getTransaction(1);
      expect(publishedTx.hash).toStrictEqual(
        '0x2cc5a25744486f7383edebbf32003e5a66e18135799593d6b5cdd2bb43674f09',
      );
      expect(publishedTx.status).toStrictEqual(TransactionStatus.submitted);
    });

    it('should call _trackTransactionMetricsEvent with the correct params', async () => {
      const rawTx =
        '0x477b2e6553c917af0db0388ae3da62965ff1a184558f61b749d1266b2e6d024c';
      txController.txStateManager.addTransaction(txMeta);
      await txController.publishTransaction(txMeta.id, rawTx);
      expect(trackTransactionMetricsEventSpy).toHaveBeenCalledTimes(1);
      expect(trackTransactionMetricsEventSpy.mock.calls[0][0]).toStrictEqual(
        txMeta,
      );
      expect(trackTransactionMetricsEventSpy.mock.calls[0][1]).toStrictEqual(
        TransactionStatus.submitted,
      );
    });
  });

  describe('#_markNonceDuplicatesDropped', () => {
    it('should mark all nonce duplicates as dropped without marking the confirmed transaction as dropped', () => {
      txController.txStateManager._addTransactionsToState([
        {
          id: 1,
          status: TransactionStatus.confirmed,
          metamaskNetworkId: currentNetworkId,
          history: [{}],
          txParams: {
            to: VALID_ADDRESS_TWO,
            from: VALID_ADDRESS,
            nonce: '0x01',
          },
        },
        {
          id: 2,
          status: TransactionStatus.submitted,
          metamaskNetworkId: currentNetworkId,
          history: [{}],
          txParams: {
            to: VALID_ADDRESS_TWO,
            from: VALID_ADDRESS,
            nonce: '0x01',
          },
        },
        {
          id: 3,
          status: TransactionStatus.submitted,
          metamaskNetworkId: currentNetworkId,
          history: [{}],
          txParams: {
            to: VALID_ADDRESS_TWO,
            from: VALID_ADDRESS,
            nonce: '0x01',
          },
        },
        {
          id: 4,
          status: TransactionStatus.submitted,
          metamaskNetworkId: currentNetworkId,
          history: [{}],
          txParams: {
            to: VALID_ADDRESS_TWO,
            from: VALID_ADDRESS,
            nonce: '0x01',
          },
        },
        {
          id: 5,
          status: TransactionStatus.submitted,
          metamaskNetworkId: currentNetworkId,
          history: [{}],
          txParams: {
            to: VALID_ADDRESS_TWO,
            from: VALID_ADDRESS,
            nonce: '0x01',
          },
        },
        {
          id: 6,
          status: TransactionStatus.submitted,
          metamaskNetworkId: currentNetworkId,
          history: [{}],
          txParams: {
            to: VALID_ADDRESS_TWO,
            from: VALID_ADDRESS,
            nonce: '0x01',
          },
        },
        {
          id: 7,
          status: TransactionStatus.submitted,
          metamaskNetworkId: currentNetworkId,
          history: [{}],
          txParams: {
            to: VALID_ADDRESS_TWO,
            from: VALID_ADDRESS,
            nonce: '0x01',
          },
        },
      ]);
      txController._markNonceDuplicatesDropped(1);
      const confirmedTx = txController.txStateManager.getTransaction(1);
      const droppedTxs = txController.txStateManager.getTransactions({
        searchCriteria: {
          nonce: '0x01',
          status: TransactionStatus.dropped,
        },
      });
      expect(confirmedTx.status).toStrictEqual(TransactionStatus.confirmed);
      expect(droppedTxs).toHaveLength(6);
    });
  });

  describe('#getPendingTransactions', () => {
    it('should show only submitted and approved transactions as pending transaction', () => {
      txController.txStateManager._addTransactionsToState([
        {
          id: 1,
          status: TransactionStatus.unapproved,
          metamaskNetworkId: currentNetworkId,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
          },
        },
        {
          id: 2,
          status: TransactionStatus.rejected,
          metamaskNetworkId: currentNetworkId,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
          },
          history: [{}],
        },
        {
          id: 3,
          status: TransactionStatus.approved,
          metamaskNetworkId: currentNetworkId,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
          },
          history: [{}],
        },
        {
          id: 4,
          status: TransactionStatus.signed,
          metamaskNetworkId: currentNetworkId,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
          },
          history: [{}],
        },
        {
          id: 5,
          status: TransactionStatus.submitted,
          metamaskNetworkId: currentNetworkId,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
          },
          history: [{}],
        },
        {
          id: 6,
          status: TransactionStatus.confirmed,
          metamaskNetworkId: currentNetworkId,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
          },
          history: [{}],
        },
        {
          id: 7,
          status: TransactionStatus.failed,
          metamaskNetworkId: currentNetworkId,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
          },
          history: [{}],
        },
      ]);

      expect(
        txController.pendingTxTracker.getPendingTransactions(),
      ).toHaveLength(2);
      const states = txController.pendingTxTracker
        .getPendingTransactions()
        .map((tx) => tx.status);
      expect(states.includes(TransactionStatus.approved)).toBeTruthy();
      expect(states.includes(TransactionStatus.submitted)).toBeTruthy();
    });
  });

  describe('#_trackTransactionMetricsEvent', () => {
    let trackMetaMetricsEventSpy;
    let createEventFragmentSpy;
    let finalizeEventFragmentSpy;

    beforeEach(() => {
      trackMetaMetricsEventSpy = jest
        .spyOn(txController, '_trackMetaMetricsEvent')
        .mockClear();

      createEventFragmentSpy = jest
        .spyOn(txController, 'createEventFragment')
        .mockClear();

      finalizeEventFragmentSpy = jest
        .spyOn(txController, 'finalizeEventFragment')
        .mockClear();

      jest
        .spyOn(txController, '_getEIP1559GasFeeEstimates')
        .mockClear()
        .mockImplementation()
        .resolves(mockEstimates['fee-market']);
    });

    afterEach(() => {
      trackMetaMetricsEventSpy.mockRestore();
      createEventFragmentSpy.mockRestore();
      finalizeEventFragmentSpy.mockRestore();
    });

    describe('On transaction created by the user', () => {
      let txMeta;

      beforeAll(() => {
        txMeta = {
          id: 1,
          status: TransactionStatus.unapproved,
          txParams: {
            from: fromAccount.address,
            to: '0x1678a085c290ebd122dc42cba69373b5953b831d',
            gasPrice: '0x77359400',
            gas: '0x7b0d',
            nonce: '0x4b',
          },
          type: TransactionType.simpleSend,
          origin: ORIGIN_METAMASK,
          chainId: currentChainId,
          time: 1624408066355,
          metamaskNetworkId: currentNetworkId,
          defaultGasEstimates: {
            gas: '0x7b0d',
            gasPrice: '0x77359400',
          },
        };
      });

      it('should create an event fragment when transaction added', async () => {
        const expectedPayload = {
          actionId,
          initialEvent: 'Transaction Added',
          successEvent: 'Transaction Approved',
          failureEvent: 'Transaction Rejected',
          uniqueIdentifier: 'transaction-added-1',
          category: EVENT.CATEGORIES.TRANSACTIONS,
          persist: true,
          properties: {
            chain_id: '0x5',
            eip_1559_version: '0',
            gas_edit_attempted: 'none',
            gas_edit_type: 'none',
            network: '5',
            referrer: ORIGIN_METAMASK,
            source: EVENT.SOURCE.TRANSACTION.USER,
            transaction_type: TransactionType.simpleSend,
            account_type: 'MetaMask',
            asset_type: AssetType.native,
            token_standard: TokenStandard.none,
            device_model: 'N/A',
            transaction_speed_up: false,
          },
          sensitiveProperties: {
            default_gas: '0.000031501',
            default_gas_price: '2',
            gas_price: '2',
            gas_limit: '0x7b0d',
            transaction_contract_method: undefined,
            transaction_replaced: undefined,
            first_seen: 1624408066355,
            transaction_envelope_type: TRANSACTION_ENVELOPE_TYPE_NAMES.LEGACY,
            status: 'unapproved',
          },
        };

        await txController._trackTransactionMetricsEvent(
          txMeta,
          TransactionMetaMetricsEvent.added,
          actionId,
        );
        expect(createEventFragmentSpy).toHaveBeenCalledTimes(1);
        expect(finalizeEventFragmentSpy).toHaveBeenCalledTimes(0);
        expect(createEventFragmentSpy.mock.calls[0][0]).toStrictEqual(
          expectedPayload,
        );
      });

      it('should finalize the transaction added fragment as abandoned if user rejects transaction', async () => {
        fragmentExists = true;
        await txController._trackTransactionMetricsEvent(
          txMeta,
          TransactionMetaMetricsEvent.rejected,
          actionId,
        );
        expect(createEventFragmentSpy).toHaveBeenCalledTimes(0);
        expect(finalizeEventFragmentSpy).toHaveBeenCalledTimes(1);
        expect(finalizeEventFragmentSpy.mock.calls[0][0]).toStrictEqual(
          'transaction-added-1',
        );
        expect(finalizeEventFragmentSpy.mock.calls[0][1]).toStrictEqual({
          abandoned: true,
        });
      });

      it('should finalize the transaction added fragment if user approves transaction', async () => {
        fragmentExists = true;
        await txController._trackTransactionMetricsEvent(
          txMeta,
          TransactionMetaMetricsEvent.approved,
          actionId,
        );
        expect(createEventFragmentSpy).toHaveBeenCalledTimes(0);
        expect(finalizeEventFragmentSpy).toHaveBeenCalledTimes(1);
        expect(finalizeEventFragmentSpy.mock.calls[0][0]).toStrictEqual(
          'transaction-added-1',
        );
        expect(finalizeEventFragmentSpy.mock.calls[0][1]).toStrictEqual(
          undefined,
        );
      });

      it('should create an event fragment when transaction is submitted', async () => {
        const expectedPayload = {
          actionId,
          initialEvent: 'Transaction Submitted',
          successEvent: 'Transaction Finalized',
          uniqueIdentifier: 'transaction-submitted-1',
          category: EVENT.CATEGORIES.TRANSACTIONS,
          persist: true,
          properties: {
            chain_id: '0x5',
            eip_1559_version: '0',
            gas_edit_attempted: 'none',
            gas_edit_type: 'none',
            network: '5',
            referrer: ORIGIN_METAMASK,
            source: EVENT.SOURCE.TRANSACTION.USER,
            transaction_type: TransactionType.simpleSend,
            account_type: 'MetaMask',
            asset_type: AssetType.native,
            token_standard: TokenStandard.none,
            device_model: 'N/A',
            transaction_speed_up: false,
          },
          sensitiveProperties: {
            default_gas: '0.000031501',
            default_gas_price: '2',
            gas_price: '2',
            gas_limit: '0x7b0d',
            transaction_contract_method: undefined,
            transaction_replaced: undefined,
            first_seen: 1624408066355,
            transaction_envelope_type: TRANSACTION_ENVELOPE_TYPE_NAMES.LEGACY,
            status: 'unapproved',
          },
        };

        await txController._trackTransactionMetricsEvent(
          txMeta,
          TransactionMetaMetricsEvent.submitted,
          actionId,
        );
        expect(createEventFragmentSpy).toHaveBeenCalledTimes(1);
        expect(finalizeEventFragmentSpy).toHaveBeenCalledTimes(0);
        expect(createEventFragmentSpy.mock.calls[0][0]).toStrictEqual(
          expectedPayload,
        );
      });

      it('should finalize the transaction submitted fragment when transaction finalizes', async () => {
        fragmentExists = true;
        await txController._trackTransactionMetricsEvent(
          txMeta,
          TransactionMetaMetricsEvent.finalized,
          actionId,
        );
        expect(createEventFragmentSpy).toHaveBeenCalledTimes(0);
        expect(finalizeEventFragmentSpy).toHaveBeenCalledTimes(1);
        expect(finalizeEventFragmentSpy.mock.calls[0][0]).toStrictEqual(
          'transaction-submitted-1',
        );
        expect(finalizeEventFragmentSpy.mock.calls[0][1]).toStrictEqual(
          undefined,
        );
      });
    });

    describe('On transaction suggested by dapp', () => {
      let txMeta;
      beforeAll(() => {
        txMeta = {
          id: 1,
          status: TransactionStatus.unapproved,
          txParams: {
            from: fromAccount.address,
            to: '0x1678a085c290ebd122dc42cba69373b5953b831d',
            gasPrice: '0x77359400',
            gas: '0x7b0d',
            nonce: '0x4b',
          },
          type: TransactionType.simpleSend,
          origin: 'other',
          chainId: currentChainId,
          time: 1624408066355,
          metamaskNetworkId: currentNetworkId,
          defaultGasEstimates: {
            gas: '0x7b0d',
            gasPrice: '0x77359400',
          },
        };
      });

      it('should create an event fragment when transaction added', async () => {
        const expectedPayload = {
          actionId,
          initialEvent: 'Transaction Added',
          successEvent: 'Transaction Approved',
          failureEvent: 'Transaction Rejected',
          uniqueIdentifier: 'transaction-added-1',
          category: EVENT.CATEGORIES.TRANSACTIONS,
          persist: true,
          properties: {
            chain_id: '0x5',
            eip_1559_version: '0',
            gas_edit_attempted: 'none',
            gas_edit_type: 'none',
            network: '5',
            referrer: 'other',
            source: EVENT.SOURCE.TRANSACTION.DAPP,
            transaction_type: TransactionType.simpleSend,
            account_type: 'MetaMask',
            asset_type: AssetType.native,
            token_standard: TokenStandard.none,
            device_model: 'N/A',
            transaction_speed_up: false,
          },
          sensitiveProperties: {
            default_gas: '0.000031501',
            default_gas_price: '2',
            gas_price: '2',
            gas_limit: '0x7b0d',
            transaction_contract_method: undefined,
            transaction_replaced: undefined,
            first_seen: 1624408066355,
            transaction_envelope_type: TRANSACTION_ENVELOPE_TYPE_NAMES.LEGACY,
            status: 'unapproved',
          },
        };

        await txController._trackTransactionMetricsEvent(
          txMeta,
          TransactionMetaMetricsEvent.added,
          actionId,
        );
        expect(createEventFragmentSpy).toHaveBeenCalledTimes(1);
        expect(finalizeEventFragmentSpy).toHaveBeenCalledTimes(0);
        expect(createEventFragmentSpy.mock.calls[0][0]).toStrictEqual(
          expectedPayload,
        );
      });

      it('should finalize the transaction added fragment as abandoned if user rejects transaction', async () => {
        fragmentExists = true;

        await txController._trackTransactionMetricsEvent(
          txMeta,
          TransactionMetaMetricsEvent.rejected,
          actionId,
        );
        expect(createEventFragmentSpy).toHaveBeenCalledTimes(0);
        expect(finalizeEventFragmentSpy).toHaveBeenCalledTimes(1);
        expect(finalizeEventFragmentSpy.mock.calls[0][0]).toStrictEqual(
          'transaction-added-1',
        );
        expect(finalizeEventFragmentSpy.mock.calls[0][1]).toStrictEqual({
          abandoned: true,
        });
      });

      it('should finalize the transaction added fragment if user approves transaction', async () => {
        fragmentExists = true;

        await txController._trackTransactionMetricsEvent(
          txMeta,
          TransactionMetaMetricsEvent.approved,
          actionId,
        );
        expect(createEventFragmentSpy).toHaveBeenCalledTimes(0);
        expect(finalizeEventFragmentSpy).toHaveBeenCalledTimes(1);
        expect(finalizeEventFragmentSpy.mock.calls[0][0]).toStrictEqual(
          'transaction-added-1',
        );
        expect(finalizeEventFragmentSpy.mock.calls[0][1]).toStrictEqual(
          undefined,
        );
      });

      it('should create an event fragment when transaction is submitted', async () => {
        const expectedPayload = {
          actionId,
          initialEvent: 'Transaction Submitted',
          successEvent: 'Transaction Finalized',
          uniqueIdentifier: 'transaction-submitted-1',
          category: EVENT.CATEGORIES.TRANSACTIONS,
          persist: true,
          properties: {
            chain_id: '0x5',
            eip_1559_version: '0',
            gas_edit_attempted: 'none',
            gas_edit_type: 'none',
            network: '5',
            referrer: 'other',
            source: EVENT.SOURCE.TRANSACTION.DAPP,
            transaction_type: TransactionType.simpleSend,
            account_type: 'MetaMask',
            asset_type: AssetType.native,
            token_standard: TokenStandard.none,
            device_model: 'N/A',
            transaction_speed_up: false,
          },
          sensitiveProperties: {
            default_gas: '0.000031501',
            default_gas_price: '2',
            gas_price: '2',
            gas_limit: '0x7b0d',
            transaction_contract_method: undefined,
            transaction_replaced: undefined,
            first_seen: 1624408066355,
            transaction_envelope_type: TRANSACTION_ENVELOPE_TYPE_NAMES.LEGACY,
            status: 'unapproved',
          },
        };

        await txController._trackTransactionMetricsEvent(
          txMeta,
          TransactionMetaMetricsEvent.submitted,
          actionId,
        );
        expect(createEventFragmentSpy).toHaveBeenCalledTimes(1);
        expect(finalizeEventFragmentSpy).toHaveBeenCalledTimes(0);
        expect(createEventFragmentSpy.mock.calls[0][0]).toStrictEqual(
          expectedPayload,
        );
      });

      it('should finalize the transaction submitted fragment when transaction finalizes', async () => {
        fragmentExists = true;

        await txController._trackTransactionMetricsEvent(
          txMeta,
          TransactionMetaMetricsEvent.finalized,
          actionId,
        );
        expect(createEventFragmentSpy).toHaveBeenCalledTimes(0);
        expect(finalizeEventFragmentSpy).toHaveBeenCalledTimes(1);
        expect(finalizeEventFragmentSpy.mock.calls[0][0]).toStrictEqual(
          'transaction-submitted-1',
        );
        expect(finalizeEventFragmentSpy.mock.calls[0][1]).toStrictEqual(
          undefined,
        );
      });
    });

    it('should create missing fragments when events happen out of order or are missing', async () => {
      const txMeta = {
        id: 1,
        status: TransactionStatus.unapproved,
        txParams: {
          from: fromAccount.address,
          to: '0x1678a085c290ebd122dc42cba69373b5953b831d',
          gasPrice: '0x77359400',
          gas: '0x7b0d',
          nonce: '0x4b',
        },
        type: TransactionType.simpleSend,
        origin: 'other',
        chainId: currentChainId,
        time: 1624408066355,
        metamaskNetworkId: currentNetworkId,
      };

      const expectedPayload = {
        actionId,
        successEvent: 'Transaction Approved',
        failureEvent: 'Transaction Rejected',
        uniqueIdentifier: 'transaction-added-1',
        category: EVENT.CATEGORIES.TRANSACTIONS,
        persist: true,
        properties: {
          chain_id: '0x5',
          eip_1559_version: '0',
          gas_edit_attempted: 'none',
          gas_edit_type: 'none',
          network: '5',
          referrer: 'other',
          source: EVENT.SOURCE.TRANSACTION.DAPP,
          transaction_type: TransactionType.simpleSend,
          account_type: 'MetaMask',
          asset_type: AssetType.native,
          token_standard: TokenStandard.none,
          device_model: 'N/A',
          transaction_speed_up: false,
        },
        sensitiveProperties: {
          gas_price: '2',
          gas_limit: '0x7b0d',
          transaction_contract_method: undefined,
          transaction_replaced: undefined,
          first_seen: 1624408066355,
          transaction_envelope_type: TRANSACTION_ENVELOPE_TYPE_NAMES.LEGACY,
          status: 'unapproved',
        },
      };
      await txController._trackTransactionMetricsEvent(
        txMeta,
        TransactionMetaMetricsEvent.approved,
        actionId,
      );
      expect(createEventFragmentSpy).toHaveBeenCalledTimes(1);
      expect(createEventFragmentSpy.mock.calls[0][0]).toStrictEqual(
        expectedPayload,
      );
      expect(finalizeEventFragmentSpy).toHaveBeenCalledTimes(1);
      expect(finalizeEventFragmentSpy.mock.calls[0][0]).toStrictEqual(
        'transaction-added-1',
      );
      expect(finalizeEventFragmentSpy.mock.calls[0][1]).toStrictEqual(
        undefined,
      );
    });

    it('should call _trackMetaMetricsEvent with the correct payload (extra params)', async () => {
      const txMeta = {
        id: 1,
        status: TransactionStatus.unapproved,
        txParams: {
          from: fromAccount.address,
          to: '0x1678a085c290ebd122dc42cba69373b5953b831d',
          gasPrice: '0x77359400',
          gas: '0x7b0d',
          nonce: '0x4b',
        },
        type: TransactionType.simpleSend,
        origin: 'other',
        chainId: currentChainId,
        time: 1624408066355,
        metamaskNetworkId: currentNetworkId,
      };
      const expectedPayload = {
        actionId,
        initialEvent: 'Transaction Added',
        successEvent: 'Transaction Approved',
        failureEvent: 'Transaction Rejected',
        uniqueIdentifier: 'transaction-added-1',
        persist: true,
        category: EVENT.CATEGORIES.TRANSACTIONS,
        properties: {
          network: '5',
          referrer: 'other',
          source: EVENT.SOURCE.TRANSACTION.DAPP,
          transaction_type: TransactionType.simpleSend,
          chain_id: '0x5',
          eip_1559_version: '0',
          gas_edit_attempted: 'none',
          gas_edit_type: 'none',
          account_type: 'MetaMask',
          asset_type: AssetType.native,
          token_standard: TokenStandard.none,
          device_model: 'N/A',
          transaction_speed_up: false,
        },
        sensitiveProperties: {
          baz: 3.0,
          foo: 'bar',
          gas_price: '2',
          gas_limit: '0x7b0d',
          transaction_contract_method: undefined,
          transaction_replaced: undefined,
          first_seen: 1624408066355,
          transaction_envelope_type: TRANSACTION_ENVELOPE_TYPE_NAMES.LEGACY,
          status: 'unapproved',
        },
      };

      await txController._trackTransactionMetricsEvent(
        txMeta,
        TransactionMetaMetricsEvent.added,
        actionId,
        {
          baz: 3.0,
          foo: 'bar',
        },
      );
      expect(createEventFragmentSpy).toHaveBeenCalledTimes(1);
      expect(finalizeEventFragmentSpy).toHaveBeenCalledTimes(0);
      expect(createEventFragmentSpy.mock.calls[0][0]).toStrictEqual(
        expectedPayload,
      );
    });

    it('should call _trackMetaMetricsEvent with the correct payload (EIP-1559)', async () => {
      const txMeta = {
        id: 1,
        status: TransactionStatus.unapproved,
        txParams: {
          from: fromAccount.address,
          to: '0x1678a085c290ebd122dc42cba69373b5953b831d',
          maxFeePerGas: '0x77359400',
          maxPriorityFeePerGas: '0x77359400',
          gas: '0x7b0d',
          nonce: '0x4b',
          estimateSuggested: GasRecommendations.medium,
          estimateUsed: GasRecommendations.high,
        },
        type: TransactionType.simpleSend,
        origin: 'other',
        chainId: currentChainId,
        time: 1624408066355,
        metamaskNetworkId: currentNetworkId,
        defaultGasEstimates: {
          estimateType: 'medium',
          maxFeePerGas: '0x77359400',
          maxPriorityFeePerGas: '0x77359400',
        },
      };
      const expectedPayload = {
        actionId,
        initialEvent: 'Transaction Added',
        successEvent: 'Transaction Approved',
        failureEvent: 'Transaction Rejected',
        uniqueIdentifier: 'transaction-added-1',
        persist: true,
        category: EVENT.CATEGORIES.TRANSACTIONS,
        properties: {
          chain_id: '0x5',
          eip_1559_version: '2',
          gas_edit_attempted: 'none',
          gas_edit_type: 'none',
          network: '5',
          referrer: 'other',
          source: EVENT.SOURCE.TRANSACTION.DAPP,
          transaction_type: TransactionType.simpleSend,
          account_type: 'MetaMask',
          asset_type: AssetType.native,
          token_standard: TokenStandard.none,
          device_model: 'N/A',
          transaction_speed_up: false,
        },
        sensitiveProperties: {
          baz: 3.0,
          foo: 'bar',
          max_fee_per_gas: '2',
          max_priority_fee_per_gas: '2',
          gas_limit: '0x7b0d',
          transaction_contract_method: undefined,
          transaction_replaced: undefined,
          first_seen: 1624408066355,
          transaction_envelope_type: TRANSACTION_ENVELOPE_TYPE_NAMES.FEE_MARKET,
          status: 'unapproved',
          estimate_suggested: GasRecommendations.medium,
          estimate_used: GasRecommendations.high,
          default_estimate: 'medium',
          default_max_fee_per_gas: '70',
          default_max_priority_fee_per_gas: '7',
        },
      };

      await txController._trackTransactionMetricsEvent(
        txMeta,
        TransactionMetaMetricsEvent.added,
        actionId,
        {
          baz: 3.0,
          foo: 'bar',
        },
      );
      expect(createEventFragmentSpy).toHaveBeenCalledTimes(1);
      expect(finalizeEventFragmentSpy).toHaveBeenCalledTimes(0);
      expect(createEventFragmentSpy.mock.calls[0][0]).toStrictEqual(
        expectedPayload,
      );
    });
  });

  describe('#_getTransactionCompletionTime', () => {
    let nowStub;

    beforeEach(() => {
      nowStub = jest
        .spyOn(Date, 'now')
        .mockClear()
        .mockReturnValue(1625782016341);
    });

    afterEach(() => {
      nowStub.mockRestore();
    });

    it('calculates completion time (one)', () => {
      const submittedTime = 1625781997397;
      const result = txController._getTransactionCompletionTime(submittedTime);
      expect(result).toStrictEqual('19');
    });

    it('calculates completion time (two)', () => {
      const submittedTime = 1625781995397;
      const result = txController._getTransactionCompletionTime(submittedTime);
      expect(result).toStrictEqual('21');
    });
  });

  describe('#_getGasValuesInGWEI', () => {
    it('converts gas values in hex GWEi to dec GWEI (EIP-1559)', () => {
      const params = {
        max_fee_per_gas: '0x77359400',
        max_priority_fee_per_gas: '0x77359400',
      };
      const expectedParams = {
        max_fee_per_gas: '2',
        max_priority_fee_per_gas: '2',
      };
      const result = txController._getGasValuesInGWEI(params);
      expect(result).toStrictEqual(expectedParams);
    });

    it('converts gas values in hex GWEi to dec GWEI (non EIP-1559)', () => {
      const params = {
        gas_price: '0x37e11d600',
      };
      const expectedParams = {
        gas_price: '15',
      };
      const result = txController._getGasValuesInGWEI(params);
      expect(result).toStrictEqual(expectedParams);
    });

    it('converts gas values in hex GWEi to dec GWEI, retains estimate fields', () => {
      const params = {
        max_fee_per_gas: '0x77359400',
        max_priority_fee_per_gas: '0x77359400',
        estimate_suggested: GasRecommendations.medium,
        estimate_used: GasRecommendations.high,
      };
      const expectedParams = {
        max_fee_per_gas: '2',
        max_priority_fee_per_gas: '2',
        estimate_suggested: GasRecommendations.medium,
        estimate_used: GasRecommendations.high,
      };
      const result = txController._getGasValuesInGWEI(params);
      expect(result).toStrictEqual(expectedParams);
    });
  });

  describe('update transaction methods', () => {
    let txStateManager;

    beforeEach(() => {
      txStateManager = txController.txStateManager;
      txStateManager.addTransaction({
        id: '1',
        status: TransactionStatus.unapproved,
        metamaskNetworkId: currentNetworkId,
        txParams: {
          gasLimit: '0x001',
          gasPrice: '0x002',
          // max fees can not be mixed with gasPrice
          // maxPriorityFeePerGas: '0x003',
          // maxFeePerGas: '0x004',
          to: VALID_ADDRESS,
          from: VALID_ADDRESS,
        },
        estimateUsed: '0x005',
        estimatedBaseFee: '0x006',
        decEstimatedBaseFee: '6',
        type: 'swap',
        sourceTokenSymbol: 'ETH',
        destinationTokenSymbol: 'UNI',
        destinationTokenDecimals: 16,
        destinationTokenAddress: VALID_ADDRESS,
        swapMetaData: {},
        swapTokenValue: '0x007',
        userEditedGasLimit: '0x008',
        userFeeLevel: 'medium',
      });
    });

    it('updates transaction gas fees', () => {
      // test update gasFees
      txController.updateTransactionGasFees('1', {
        gasPrice: '0x0022',
        gasLimit: '0x0011',
      });
      let result = txStateManager.getTransaction('1');
      expect(result.txParams.gasPrice).toStrictEqual('0x0022');
      // TODO: weird behavior here...only gasPrice gets returned.
      // assert.equal(result.txParams.gasLimit, '0x0011');

      // test update maxPriorityFeePerGas
      txStateManager.addTransaction({
        id: '2',
        status: TransactionStatus.unapproved,
        metamaskNetworkId: currentNetworkId,
        txParams: {
          maxPriorityFeePerGas: '0x003',
          to: VALID_ADDRESS,
          from: VALID_ADDRESS,
        },
        estimateUsed: '0x005',
      });
      txController.updateTransactionGasFees('2', {
        maxPriorityFeePerGas: '0x0033',
      });
      result = txStateManager.getTransaction('2');
      expect(result.txParams.maxPriorityFeePerGas).toStrictEqual('0x0033');

      // test update maxFeePerGas
      txStateManager.addTransaction({
        id: '3',
        status: TransactionStatus.unapproved,
        metamaskNetworkId: currentNetworkId,
        txParams: {
          maxPriorityFeePerGas: '0x003',
          maxFeePerGas: '0x004',
          to: VALID_ADDRESS,
          from: VALID_ADDRESS,
        },
        estimateUsed: '0x005',
      });
      txController.updateTransactionGasFees('3', { maxFeePerGas: '0x0044' });
      result = txStateManager.getTransaction('3');
      expect(result.txParams.maxFeePerGas).toStrictEqual('0x0044');

      // test update estimate used
      txController.updateTransactionGasFees('3', { estimateUsed: '0x0055' });
      result = txStateManager.getTransaction('3');
      expect(result.estimateUsed).toStrictEqual('0x0055');
    });

    it('updates estimated base fee', () => {
      txController.updateTransactionEstimatedBaseFee('1', {
        estimatedBaseFee: '0x0066',
        decEstimatedBaseFee: '66',
      });
      const result = txStateManager.getTransaction('1');
      expect(result.estimatedBaseFee).toStrictEqual('0x0066');
      expect(result.decEstimatedBaseFee).toStrictEqual('66');
    });

    it('updates swap approval transaction', () => {
      txController.updateSwapApprovalTransaction('1', {
        type: 'swapApproval',
        sourceTokenSymbol: 'XBN',
      });

      const result = txStateManager.getTransaction('1');
      expect(result.type).toStrictEqual('swapApproval');
      expect(result.sourceTokenSymbol).toStrictEqual('XBN');
    });

    it('updates swap transaction', () => {
      txController.updateSwapTransaction('1', {
        sourceTokenSymbol: 'BTCX',
        destinationTokenSymbol: 'ETH',
      });

      const result = txStateManager.getTransaction('1');
      expect(result.sourceTokenSymbol).toStrictEqual('BTCX');
      expect(result.destinationTokenSymbol).toStrictEqual('ETH');
      expect(result.destinationTokenDecimals).toStrictEqual(16);
      expect(result.destinationTokenAddress).toStrictEqual(VALID_ADDRESS);
      expect(result.swapTokenValue).toStrictEqual('0x007');

      txController.updateSwapTransaction('1', {
        type: 'swapped',
        destinationTokenDecimals: 8,
        destinationTokenAddress: VALID_ADDRESS_TWO,
        swapTokenValue: '0x0077',
      });
      expect(result.sourceTokenSymbol).toStrictEqual('BTCX');
      expect(result.destinationTokenSymbol).toStrictEqual('ETH');
      expect(result.type).toStrictEqual('swapped');
      expect(result.destinationTokenDecimals).toStrictEqual(8);
      expect(result.destinationTokenAddress).toStrictEqual(VALID_ADDRESS_TWO);
      expect(result.swapTokenValue).toStrictEqual('0x0077');
    });

    it('updates transaction user settings', () => {
      txController.updateTransactionUserSettings('1', {
        userEditedGasLimit: '0x0088',
        userFeeLevel: 'high',
      });

      const result = txStateManager.getTransaction('1');
      expect(result.userEditedGasLimit).toStrictEqual('0x0088');
      expect(result.userFeeLevel).toStrictEqual('high');
    });

    it('should not update and should throw error if status is not type "unapproved"', () => {
      txStateManager.addTransaction({
        id: '4',
        status: TransactionStatus.dropped,
        metamaskNetworkId: currentNetworkId,
        txParams: {
          maxPriorityFeePerGas: '0x007',
          maxFeePerGas: '0x008',
          to: VALID_ADDRESS,
          from: VALID_ADDRESS,
        },
        estimateUsed: '0x009',
      });

      expect(() =>
        txController.updateTransactionGasFees('4', {
          maxFeePerGas: '0x0088',
        }),
      ).toThrow('qwer');

      const transaction = txStateManager.getTransaction('4');
      expect(transaction.txParams.maxFeePerGas).toStrictEqual('0x008');
    });

    it('does not update unknown parameters in update method', () => {
      txController.updateSwapTransaction('1', {
        type: 'swapped',
        destinationTokenDecimals: 8,
        destinationTokenAddress: VALID_ADDRESS_TWO,
        swapTokenValue: '0x011',
        gasPrice: '0x12',
      });

      let result = txStateManager.getTransaction('1');

      expect(result.type).toStrictEqual('swapped');
      expect(result.destinationTokenDecimals).toStrictEqual(8);
      expect(result.destinationTokenAddress).toStrictEqual(VALID_ADDRESS_TWO);
      expect(result.swapTokenValue).toStrictEqual('0x011');
      expect(result.txParams.gasPrice).toStrictEqual('0x002'); // not updated even though it's passed in to update

      txController.updateTransactionGasFees('1', {
        estimateUsed: '0x13',
        gasPrice: '0x14',
        destinationTokenAddress: VALID_ADDRESS,
      });

      result = txStateManager.getTransaction('1');
      expect(result.estimateUsed).toStrictEqual('0x13');
      expect(result.txParams.gasPrice).toStrictEqual('0x14');
      expect(result.destinationTokenAddress).toStrictEqual(VALID_ADDRESS_TWO); // not updated even though it's passed in to update
    });
  });

  describe('updateEditableParams', () => {
    let txStateManager;

    beforeEach(() => {
      txStateManager = txController.txStateManager;
      txStateManager.addTransaction({
        id: '1',
        status: TransactionStatus.unapproved,
        metamaskNetworkId: currentNetworkId,
        txParams: {
          gas: '0x001',
          gasPrice: '0x002',
          // max fees can not be mixed with gasPrice
          // maxPriorityFeePerGas: '0x003',
          // maxFeePerGas: '0x004',
          to: VALID_ADDRESS,
          from: VALID_ADDRESS,
        },
        estimateUsed: '0x005',
        estimatedBaseFee: '0x006',
        decEstimatedBaseFee: '6',
        type: 'simpleSend',
        userEditedGasLimit: '0x008',
        userFeeLevel: 'medium',
      });
    });

    it('updates editible params when type changes from simple send to token transfer', async () => {
      providerResultStub.eth_getCode = '0xab';
      // test update gasFees
      await txController.updateEditableParams('1', {
        data: '0xa9059cbb000000000000000000000000e18035bf8712672935fdb4e5e431b1a0183d2dfc0000000000000000000000000000000000000000000000000de0b6b3a7640000',
      });
      const result = txStateManager.getTransaction('1');
      expect(result.txParams.data).toStrictEqual(
        '0xa9059cbb000000000000000000000000e18035bf8712672935fdb4e5e431b1a0183d2dfc0000000000000000000000000000000000000000000000000de0b6b3a7640000',
      );
      expect(result.type).toStrictEqual(TransactionType.tokenMethodTransfer);
    });

    it('updates editible params when type changes from token transfer to simple send', async () => {
      // test update gasFees
      txStateManager.addTransaction({
        id: '2',
        status: TransactionStatus.unapproved,
        metamaskNetworkId: currentNetworkId,
        txParams: {
          gas: '0x001',
          gasPrice: '0x002',
          // max fees can not be mixed with gasPrice
          // maxPriorityFeePerGas: '0x003',
          // maxFeePerGas: '0x004',
          to: VALID_ADDRESS,
          from: VALID_ADDRESS,
          data: '0xa9059cbb000000000000000000000000e18035bf8712672935fdb4e5e431b1a0183d2dfc0000000000000000000000000000000000000000000000000de0b6b3a7640000',
        },
        estimateUsed: '0x005',
        estimatedBaseFee: '0x006',
        decEstimatedBaseFee: '6',
        type: TransactionType.tokenMethodTransfer,
        userEditedGasLimit: '0x008',
        userFeeLevel: 'medium',
      });
      await txController.updateEditableParams('2', {
        data: '0x',
      });
      const result = txStateManager.getTransaction('2');
      expect(result.txParams.data).toStrictEqual('0x');
      expect(result.type).toStrictEqual(TransactionType.simpleSend);
    });

    it('updates editible params when type changes from simpleSend to contract interaction', async () => {
      // test update gasFees
      txStateManager.addTransaction({
        id: '3',
        status: TransactionStatus.unapproved,
        metamaskNetworkId: currentNetworkId,
        txParams: {
          gas: '0x001',
          gasPrice: '0x002',
          // max fees can not be mixed with gasPrice
          // maxPriorityFeePerGas: '0x003',
          // maxFeePerGas: '0x004',
          to: VALID_ADDRESS,
          from: VALID_ADDRESS,
        },
        estimateUsed: '0x005',
        estimatedBaseFee: '0x006',
        decEstimatedBaseFee: '6',
        type: TransactionType.tokenMethodTransfer,
        userEditedGasLimit: '0x008',
        userFeeLevel: 'medium',
      });
      providerResultStub.eth_getCode = '0x5';
      await txController.updateEditableParams('3', {
        data: '0x123',
      });
      const result = txStateManager.getTransaction('3');
      expect(result.txParams.data).toStrictEqual('0x123');
      expect(result.type).toStrictEqual(TransactionType.contractInteraction);
    });

    it('updates editible params when type does not change', async () => {
      // test update gasFees
      await txController.updateEditableParams('1', {
        data: '0x123',
        gas: '0xabc',
        from: VALID_ADDRESS_TWO,
      });
      const result = txStateManager.getTransaction('1');
      expect(result.txParams.data).toStrictEqual('0x123');
      expect(result.txParams.gas).toStrictEqual('0xabc');
      expect(result.txParams.from).toStrictEqual(VALID_ADDRESS_TWO);
      expect(result.txParams.to).toStrictEqual(VALID_ADDRESS);
      expect(result.txParams.gasPrice).toStrictEqual('0x002');
      expect(result.type).toStrictEqual(TransactionType.simpleSend);
    });
  });
});
