import EventEmitter from 'events';
import { toBuffer } from 'ethereumjs-util';
import { TransactionFactory } from '@ethereumjs/tx';
import { ObservableStore } from '@metamask/obs-store';
import sinon from 'sinon';

import {
  createTestProviderTools,
  getTestAccounts,
} from '../../../../test/stub/provider';
import {
  TRANSACTION_STATUSES,
  TRANSACTION_TYPES,
} from '../../../../shared/constants/transaction';
import { SECOND } from '../../../../shared/constants/time';
import { METAMASK_CONTROLLER_EVENTS } from '../../metamask-controller';
import TransactionController, { TRANSACTION_EVENTS } from '.';

const noop = () => true;
const currentNetworkId = '42';
const currentChainId = '0x2a';
const providerConfig = {
  type: 'kovan',
};

const VALID_ADDRESS = '0x0000000000000000000000000000000000000000';
const VALID_ADDRESS_TWO = '0x0000000000000000000000000000000000000001';

describe('Transaction Controller', () => {
  let txController, provider, providerResultStub, fromAccount;

  beforeEach(() => {
    providerResultStub = {
      // 1 gwei
      eth_gasPrice: '0x0de0b6b3a7640000',
      // by default, all accounts are external accounts (not contracts)
      eth_getCode: '0x',
    };
    provider = createTestProviderTools({ scaffold: providerResultStub })
      .provider;

    fromAccount = getTestAccounts()[0];
    const blockTrackerStub = new EventEmitter();
    blockTrackerStub.getCurrentBlock = noop;
    blockTrackerStub.getLatestBlock = noop;
    txController = new TransactionController({
      provider,
      getGasPrice() {
        return '0xee6b2800';
      },
      networkStore: new ObservableStore(currentNetworkId),
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
    });
    txController.nonceTracker.getNonceLock = () =>
      Promise.resolve({ nextNonce: 0, releaseLock: noop });
  });

  describe('#getState', () => {
    it('should return a state object with the right keys and data types', () => {
      const exposedState = txController.getState();
      expect('unapprovedTxs' in exposedState).toStrictEqual(true);
      // 'state should have the key unapprovedTxs',
      expect('currentNetworkTxList' in exposedState).toStrictEqual(true);
      // 'state should have the key currentNetworkTxList',
      expect(typeof exposedState?.unapprovedTxs === 'object').toStrictEqual(
        true,
      );
      // 'should be an object',
      expect(Array.isArray(exposedState.currentNetworkTxList)).toStrictEqual(
        true,
      );
      // 'should be an array',
    });
  });

  describe('#getUnapprovedTxCount', () => {
    it('should return the number of unapproved txs', () => {
      txController.txStateManager._addTransactionsToState([
        {
          id: 1,
          status: TRANSACTION_STATUSES.UNAPPROVED,
          metamaskNetworkId: currentNetworkId,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
          },
          history: [{}],
        },
        {
          id: 2,
          status: TRANSACTION_STATUSES.UNAPPROVED,
          metamaskNetworkId: currentNetworkId,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
          },
          history: [{}],
        },
        {
          id: 3,
          status: TRANSACTION_STATUSES.UNAPPROVED,
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
          status: TRANSACTION_STATUSES.SUBMITTED,
          metamaskNetworkId: currentNetworkId,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
          },
          history: [{}],
        },
        {
          id: 2,
          status: TRANSACTION_STATUSES.SUBMITTED,
          metamaskNetworkId: currentNetworkId,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
          },
          history: [{}],
        },
        {
          id: 3,
          status: TRANSACTION_STATUSES.SUBMITTED,
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
          status: TRANSACTION_STATUSES.CONFIRMED,
          metamaskNetworkId: currentNetworkId,
          txParams,
          history: [{}],
        },
        {
          id: 1,
          status: TRANSACTION_STATUSES.CONFIRMED,
          metamaskNetworkId: currentNetworkId,
          txParams,
          history: [{}],
        },
        {
          id: 2,
          status: TRANSACTION_STATUSES.CONFIRMED,
          metamaskNetworkId: currentNetworkId,
          txParams,
          history: [{}],
        },
        {
          id: 3,
          status: TRANSACTION_STATUSES.UNAPPROVED,
          metamaskNetworkId: currentNetworkId,
          txParams,
          history: [{}],
        },
        {
          id: 4,
          status: TRANSACTION_STATUSES.REJECTED,
          metamaskNetworkId: currentNetworkId,
          txParams,
          history: [{}],
        },
        {
          id: 5,
          status: TRANSACTION_STATUSES.APPROVED,
          metamaskNetworkId: currentNetworkId,
          txParams,
          history: [{}],
        },
        {
          id: 6,
          status: TRANSACTION_STATUSES.SIGNED,
          metamaskNetworkId: currentNetworkId,
          txParams,
          history: [{}],
        },
        {
          id: 7,
          status: TRANSACTION_STATUSES.SUBMITTED,
          metamaskNetworkId: currentNetworkId,
          txParams,
          history: [{}],
        },
        {
          id: 8,
          status: TRANSACTION_STATUSES.FAILED,
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
        status: TRANSACTION_STATUSES.UNAPPROVED,
        id: 1,
        metamaskNetworkId: currentNetworkId,
        txParams,
        history: [{}],
      };
      txController.txStateManager._addTransactionsToState([txMeta]);
      stub = sinon
        .stub(txController, 'addUnapprovedTransaction')
        .callsFake(() => {
          txController.emit('newUnapprovedTx', txMeta);
          return Promise.resolve(
            txController.txStateManager.addTransaction(txMeta),
          );
        });
    });

    afterEach(() => {
      txController.txStateManager._addTransactionsToState([]);
      stub.restore();
    });

    it('should resolve when finished and status is submitted and resolve with the hash', async () => {
      txController.once('newUnapprovedTx', (txMetaFromEmit) => {
        setTimeout(() => {
          txController.setTxHash(txMetaFromEmit.id, '0x0');
          txController.txStateManager.setTxStatusSubmitted(txMetaFromEmit.id);
        });
      });

      const hash = await txController.newUnapprovedTransaction(txParams);
      expect(hash).toStrictEqual(expect.anything()); // 'newUnapprovedTransaction needs to return the hash'
    });

    it('should reject when finished and status is rejected', async () => {
      txController.once('newUnapprovedTx', (txMetaFromEmit) => {
        setTimeout(() => {
          txController.txStateManager.setTxStatusRejected(txMetaFromEmit.id);
        });
      });

      await expect(() =>
        txController.newUnapprovedTransaction(txParams),
      ).rejects.toThrow({
        message: 'MetaMask Tx Signature: User denied transaction signature.',
      });
    });
  });

  describe('#addUnapprovedTransaction', () => {
    const selectedAddress = '0x1678a085c290ebd122dc42cba69373b5953b831d';
    const recipientAddress = '0xc42edfcc21ed14dda456aa0756c153f7985d8813';

    let getSelectedAddress, getPermittedAccounts;
    beforeEach(() => {
      getSelectedAddress = sinon
        .stub(txController, 'getSelectedAddress')
        .returns(selectedAddress);
      getPermittedAccounts = sinon
        .stub(txController, 'getPermittedAccounts')
        .returns([selectedAddress]);
    });

    afterEach(() => {
      getSelectedAddress.restore();
      getPermittedAccounts.restore();
    });

    it('should add an unapproved transaction and return a valid txMeta', async () => {
      const txMeta = await txController.addUnapprovedTransaction({
        from: selectedAddress,
        to: recipientAddress,
      });
      expect('id' in txMeta).toStrictEqual(true); // 'should have a id'
      expect('time' in txMeta).toStrictEqual(true); // 'should have a time stamp'
      expect('metamaskNetworkId' in txMeta).toStrictEqual(true); // 'should have a metamaskNetworkId'
      expect('txParams' in txMeta).toStrictEqual(true); // 'should have a txParams'
      expect('history' in txMeta).toStrictEqual(true); // 'should have a history'
      expect(txMeta.txParams.value).toStrictEqual('0x0');
      // 'should have added 0x0 as the value',

      const memTxMeta = txController.txStateManager.getTransaction(txMeta.id);
      expect(txMeta).toStrictEqual(memTxMeta);
    });

    it('should emit newUnapprovedTx event and pass txMeta as the first argument', () => {
      providerResultStub.eth_gasPrice = '4a817c800';
      txController.once('newUnapprovedTx', (txMetaFromEmit) => {
        expect(txMetaFromEmit).toStrictEqual(expect.anything()); // 'txMeta is falsy'
      });
      txController.addUnapprovedTransaction({
        from: selectedAddress,
        to: recipientAddress,
      });
    });

    it("should fail if the from address isn't the selected address", async () => {
      await expect(() =>
        txController.addUnapprovedTransaction({
          from: '0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2',
        }),
      ).rejects.toThrow('Invalid transaction params');
    });

    it('should fail if netId is loading', async () => {
      txController.networkStore = new ObservableStore('loading');
      await expect(() =>
        txController.addUnapprovedTransaction({
          from: selectedAddress,
          to: '0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2',
        }),
      ).rejects.toThrow('MetaMask is having trouble connecting to the network');
    });
  });

  describe('#addTxGasDefaults', () => {
    it('should add the tx defaults if their are none', async () => {
      txController.txStateManager._addTransactionsToState([
        {
          id: 1,
          status: TRANSACTION_STATUSES.UNAPPROVED,
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
      expect(txMetaWithDefaults.txParams.gasPrice).toStrictEqual('0x4a817c800');
      // 'should have added the gas price'
      expect(txMetaWithDefaults.txParams.gas).toStrictEqual('0x1e85');
      // 'should have added the gas field'
    });
  });

  describe('#addTransaction', () => {
    let trackTransactionMetricsEventSpy;

    beforeEach(() => {
      trackTransactionMetricsEventSpy = sinon.spy(
        txController,
        '_trackTransactionMetricsEvent',
      );
    });

    afterEach(() => {
      trackTransactionMetricsEventSpy.restore();
    });

    it('should emit updates', () => {
      const txMeta = {
        id: '1',
        status: TRANSACTION_STATUSES.UNAPPROVED,
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
      // eslint-disable-next-line jest/valid-expect-in-promise
      Promise.all(listeners).then((returnValues) => {
        expect(returnValues.pop()).toStrictEqual(txMeta);
        // 'last event 1:unapproved should return txMeta',
      });
      txController.addTransaction(txMeta);

    });

    it('should call _trackTransactionMetricsEvent with the correct params', () => {
      const txMeta = {
        id: 1,
        status: TRANSACTION_STATUSES.UNAPPROVED,
        txParams: {
          from: fromAccount.address,
          to: '0x1678a085c290ebd122dc42cba69373b5953b831d',
          gasPrice: '0x77359400',
          gas: '0x7b0d',
          nonce: '0x4b',
        },
        type: 'sentEther',
        origin: 'metamask',
        chainId: currentChainId,
        time: 1624408066355,
        metamaskNetworkId: currentNetworkId,
      };

      txController.addTransaction(txMeta);

      expect(trackTransactionMetricsEventSpy.callCount).toStrictEqual(1);
      expect(trackTransactionMetricsEventSpy.getCall(0).args[0]).toStrictEqual(
        txMeta,
      );
      expect(trackTransactionMetricsEventSpy.getCall(0).args[1]).toStrictEqual(
        TRANSACTION_EVENTS.ADDED,
      );
    });
  });

  describe('#approveTransaction', () => {
    it('does not overwrite set values', async () => {
      const originalValue = '0x01';
      const txMeta = {
        id: '1',
        status: TRANSACTION_STATUSES.UNAPPROVED,
        metamaskNetworkId: currentNetworkId,
        txParams: {
          to: VALID_ADDRESS_TWO,
          from: VALID_ADDRESS,
          nonce: originalValue,
          gas: originalValue,
          gasPrice: originalValue,
        },
      };
      jest.setTimeout(SECOND * 15);
      const wrongValue = '0x05';

      txController.addTransaction(txMeta);
      providerResultStub.eth_gasPrice = wrongValue;
      providerResultStub.eth_estimateGas = '0x5209';

      const signStub = sinon
        .stub(txController, 'signTransaction')
        .callsFake(() => Promise.resolve());

      const pubStub = sinon
        .stub(txController, 'publishTransaction')
        .callsFake(() => {
          txController.setTxHash('1', originalValue);
          txController.txStateManager.setTxStatusSubmitted('1');
        });

      await txController.approveTransaction(txMeta.id);
      const result = txController.txStateManager.getTransaction(txMeta.id);
      const params = result.txParams;

      expect(params.gas).toStrictEqual(originalValue); // 'gas unmodified'
      expect(params.gasPrice).toStrictEqual(originalValue); // 'gas price unmodified'
      expect(result.hash).toStrictEqual(originalValue);
      expect(result.status).toStrictEqual(TRANSACTION_STATUSES.SUBMITTED);
      // 'should have reached the submitted status.',
      signStub.restore();
      pubStub.restore();
    });
  });

  describe('#sign replay-protected tx', () => {
    it('prepares a tx with the chainId set', async () => {
      txController.addTransaction(
        {
          id: '1',
          status: TRANSACTION_STATUSES.UNAPPROVED,
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
      expect(ethTx.common.chainIdBN().toNumber()).toStrictEqual(42);
    });
  });

  describe('#updateAndApproveTransaction', () => {
    it('should update and approve transactions', async () => {
      const txMeta = {
        id: 1,
        status: TRANSACTION_STATUSES.UNAPPROVED,
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
      expect(tx.status).toStrictEqual(TRANSACTION_STATUSES.APPROVED);
      await approvalPromise;
    });
  });

  describe('#getChainId', () => {
    it('returns 0 when the chainId is NaN', () => {
      txController.networkStore = new ObservableStore('loading');
      expect(txController.getChainId()).toStrictEqual(0);
    });
  });

  describe('#cancelTransaction', () => {
    it('should emit a status change to rejected', () => {
      txController.txStateManager._addTransactionsToState([
        {
          id: 0,
          status: TRANSACTION_STATUSES.UNAPPROVED,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
          },
          metamaskNetworkId: currentNetworkId,
          history: [{}],
        },
        {
          id: 1,
          status: TRANSACTION_STATUSES.REJECTED,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
          },
          metamaskNetworkId: currentNetworkId,
          history: [{}],
        },
        {
          id: 2,
          status: TRANSACTION_STATUSES.APPROVED,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
          },
          metamaskNetworkId: currentNetworkId,
          history: [{}],
        },
        {
          id: 3,
          status: TRANSACTION_STATUSES.SIGNED,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
          },
          metamaskNetworkId: currentNetworkId,
          history: [{}],
        },
        {
          id: 4,
          status: TRANSACTION_STATUSES.SUBMITTED,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
          },
          metamaskNetworkId: currentNetworkId,
          history: [{}],
        },
        {
          id: 5,
          status: TRANSACTION_STATUSES.CONFIRMED,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
          },
          metamaskNetworkId: currentNetworkId,
          history: [{}],
        },
        {
          id: 6,
          status: TRANSACTION_STATUSES.FAILED,
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
          expect(status).toStrictEqual(TRANSACTION_STATUSES.REJECTED);
          // 'status should be rejected',
          expect(txId).toStrictEqual(0); // 'id should e 0'
        } catch (e) {
          throw new Error(`Should not have thrown error: ${e} `);
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

    beforeEach(() => {
      addTransactionSpy = sinon.spy(txController, 'addTransaction');
      approveTransactionSpy = sinon.spy(txController, 'approveTransaction');

      txParams = {
        nonce: '0x00',
        from: '0xB09d8505E1F4EF1CeA089D47094f5DD3464083d4',
        to: '0xB09d8505E1F4EF1CeA089D47094f5DD3464083d4',
        gas: '0x5209',
        gasPrice: '0xa',
      };
      txController.txStateManager._addTransactionsToState([
        {
          id: 1,
          status: TRANSACTION_STATUSES.SUBMITTED,
          metamaskNetworkId: currentNetworkId,
          txParams,
          history: [{}],
        },
      ]);

      expectedTxParams = { ...txParams, gasPrice: '0xb' };
    });

    afterEach(() => {
      addTransactionSpy.restore();
      approveTransactionSpy.restore();
    });

    it('should call this.addTransaction and this.approveTransaction with the expected args', async () => {
      await txController.createSpeedUpTransaction(1);
      expect(addTransactionSpy.callCount).toStrictEqual(1);

      const addTransactionArgs = addTransactionSpy.getCall(0).args[0];
      expect(addTransactionArgs.txParams).toStrictEqual(expectedTxParams);

      const { lastGasPrice, type } = addTransactionArgs;
      expect({ lastGasPrice, type }).toStrictEqual({
        lastGasPrice: '0xa',
        type: TRANSACTION_TYPES.RETRY,
      });
    });

    it('should call this.approveTransaction with the id of the returned tx', async () => {
      const result = await txController.createSpeedUpTransaction(1);
      expect(approveTransactionSpy.callCount).toStrictEqual(1);

      const approveTransactionArg = approveTransactionSpy.getCall(0).args[0];
      expect(result.id).toStrictEqual(approveTransactionArg);
    });

    it('should return the expected txMeta', async () => {
      const result = await txController.createSpeedUpTransaction(1);

      expect(result.txParams).toStrictEqual(expectedTxParams);

      const { lastGasPrice, type } = result;
      expect({ lastGasPrice, type }).toStrictEqual({
        lastGasPrice: '0xa',
        type: TRANSACTION_TYPES.RETRY,
      });
    });
  });

  describe('#publishTransaction', () => {
    let hash, txMeta, trackTransactionMetricsEventSpy;

    beforeEach(() => {
      hash =
        '0x2a5523c6fa98b47b7d9b6c8320179785150b42a16bcff36b398c5062b65657e8';
      txMeta = {
        id: 1,
        status: TRANSACTION_STATUSES.UNAPPROVED,
        txParams: {
          gas: '0x7b0d',
          to: VALID_ADDRESS,
          from: VALID_ADDRESS_TWO,
        },
        metamaskNetworkId: currentNetworkId,
      };
      providerResultStub.eth_sendRawTransaction = hash;
      trackTransactionMetricsEventSpy = sinon.spy(
        txController,
        '_trackTransactionMetricsEvent',
      );
    });

    afterEach(() => {
      trackTransactionMetricsEventSpy.restore();
    });

    it('should publish a tx, updates the rawTx when provided a one', async () => {
      const rawTx =
        '0x477b2e6553c917af0db0388ae3da62965ff1a184558f61b749d1266b2e6d024c';
      txController.txStateManager.addTransaction(txMeta);
      await txController.publishTransaction(txMeta.id, rawTx);
      const publishedTx = txController.txStateManager.getTransaction(1);
      expect(publishedTx.hash).toStrictEqual(hash);
      expect(publishedTx.status).toStrictEqual(TRANSACTION_STATUSES.SUBMITTED);
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
      expect(publishedTx.status).toStrictEqual(TRANSACTION_STATUSES.SUBMITTED);
    });

    it('should call _trackTransactionMetricsEvent with the correct params', async () => {
      const rawTx =
        '0x477b2e6553c917af0db0388ae3da62965ff1a184558f61b749d1266b2e6d024c';
      txController.txStateManager.addTransaction(txMeta);
      await txController.publishTransaction(txMeta.id, rawTx);
      expect(trackTransactionMetricsEventSpy.callCount).toStrictEqual(1);
      expect(trackTransactionMetricsEventSpy.getCall(0).args[0]).toStrictEqual(
        txMeta,
      );
      expect(trackTransactionMetricsEventSpy.getCall(0).args[1]).toStrictEqual(
        TRANSACTION_EVENTS.SUBMITTED,
      );
      expect(trackTransactionMetricsEventSpy.getCall(0).args[2]).toStrictEqual({
        gas_limit: txMeta.txParams.gas,
      });
    });
  });

  describe('#_markNonceDuplicatesDropped', () => {
    it('should mark all nonce duplicates as dropped without marking the confirmed transaction as dropped', () => {
      txController.txStateManager._addTransactionsToState([
        {
          id: 1,
          status: TRANSACTION_STATUSES.CONFIRMED,
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
          status: TRANSACTION_STATUSES.SUBMITTED,
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
          status: TRANSACTION_STATUSES.SUBMITTED,
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
          status: TRANSACTION_STATUSES.SUBMITTED,
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
          status: TRANSACTION_STATUSES.SUBMITTED,
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
          status: TRANSACTION_STATUSES.SUBMITTED,
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
          status: TRANSACTION_STATUSES.SUBMITTED,
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
          status: TRANSACTION_STATUSES.DROPPED,
        },
      });
      expect(confirmedTx.status).toStrictEqual(TRANSACTION_STATUSES.CONFIRMED);
      // 'the confirmedTx should remain confirmed',
      expect(droppedTxs).toHaveLength(6); // 'their should be 6 dropped txs'
    });
  });

  describe('#_determineTransactionType', () => {
    it('should return a simple send type when to is truthy but data is falsy', async () => {
      const result = await txController._determineTransactionType({
        to: '0xabc',
        data: '',
      });
      expect(result).toStrictEqual({
        type: TRANSACTION_TYPES.SENT_ETHER,
        getCodeResponse: null,
      });
    });

    it('should return a token transfer type when data is for the respective method call', async () => {
      const result = await txController._determineTransactionType({
        to: '0xabc',
        data:
          '0xa9059cbb0000000000000000000000002f318C334780961FB129D2a6c30D0763d9a5C970000000000000000000000000000000000000000000000000000000000000000a',
      });
      expect(result).toStrictEqual({
        type: TRANSACTION_TYPES.TOKEN_METHOD_TRANSFER,
        getCodeResponse: undefined,
      });
    });

    it('should return a token approve type when data is for the respective method call', async () => {
      const result = await txController._determineTransactionType({
        to: '0xabc',
        data:
          '0x095ea7b30000000000000000000000002f318C334780961FB129D2a6c30D0763d9a5C9700000000000000000000000000000000000000000000000000000000000000005',
      });
      expect(result).toStrictEqual({
        type: TRANSACTION_TYPES.TOKEN_METHOD_APPROVE,
        getCodeResponse: undefined,
      });
    });

    it('should return a contract deployment type when to is falsy and there is data', async () => {
      const result = await txController._determineTransactionType({
        to: '',
        data: '0xabd',
      });
      expect(result).toStrictEqual({
        type: TRANSACTION_TYPES.DEPLOY_CONTRACT,
        getCodeResponse: undefined,
      });
    });

    it('should return a simple send type with a 0x getCodeResponse when there is data and but the to address is not a contract address', async () => {
      const result = await txController._determineTransactionType({
        to: '0x9e673399f795D01116e9A8B2dD2F156705131ee9',
        data: '0xabd',
      });
      expect(result).toStrictEqual({
        type: TRANSACTION_TYPES.SENT_ETHER,
        getCodeResponse: '0x',
      });
    });

    it('should return a simple send type with a null getCodeResponse when to is truthy and there is data and but getCode returns an error', async () => {
      const result = await txController._determineTransactionType({
        to: '0xabc',
        data: '0xabd',
      });
      expect(result).toStrictEqual({
        type: TRANSACTION_TYPES.SENT_ETHER,
        getCodeResponse: null,
      });
    });

    it('should return a contract interaction type with the correct getCodeResponse when to is truthy and there is data and it is not a token transaction', async () => {
      const _providerResultStub = {
        // 1 gwei
        eth_gasPrice: '0x0de0b6b3a7640000',
        // by default, all accounts are external accounts (not contracts)
        eth_getCode: '0xa',
      };
      const _provider = createTestProviderTools({
        scaffold: _providerResultStub,
      }).provider;
      const _fromAccount = getTestAccounts()[0];
      const _blockTrackerStub = new EventEmitter();
      _blockTrackerStub.getCurrentBlock = noop;
      _blockTrackerStub.getLatestBlock = noop;
      const _txController = new TransactionController({
        provider: _provider,
        getGasPrice() {
          return '0xee6b2800';
        },
        networkStore: new ObservableStore(currentNetworkId),
        getCurrentChainId: () => currentChainId,
        txHistoryLimit: 10,
        blockTracker: _blockTrackerStub,
        signTransaction: (ethTx) =>
          new Promise((resolve) => {
            ethTx.sign(_fromAccount.key);
            resolve();
          }),
        getParticipateInMetrics: () => false,
      });
      const result = await _txController._determineTransactionType({
        to: '0x9e673399f795D01116e9A8B2dD2F156705131ee9',
        data: 'abd',
      });
      expect(result).toStrictEqual({
        type: TRANSACTION_TYPES.CONTRACT_INTERACTION,
        getCodeResponse: '0x0a',
      });
    });

    it('should return a contract interaction type with the correct getCodeResponse when to is a contract address and data is falsy', async () => {
      const _providerResultStub = {
        // 1 gwei
        eth_gasPrice: '0x0de0b6b3a7640000',
        // by default, all accounts are external accounts (not contracts)
        eth_getCode: '0xa',
      };
      const _provider = createTestProviderTools({
        scaffold: _providerResultStub,
      }).provider;
      const _fromAccount = getTestAccounts()[0];
      const _blockTrackerStub = new EventEmitter();
      _blockTrackerStub.getCurrentBlock = noop;
      _blockTrackerStub.getLatestBlock = noop;
      const _txController = new TransactionController({
        provider: _provider,
        getGasPrice() {
          return '0xee6b2800';
        },
        networkStore: new ObservableStore(currentNetworkId),
        getCurrentChainId: () => currentChainId,
        txHistoryLimit: 10,
        blockTracker: _blockTrackerStub,
        signTransaction: (ethTx) =>
          new Promise((resolve) => {
            ethTx.sign(_fromAccount.key);
            resolve();
          }),
        getParticipateInMetrics: () => false,
      });
      const result = await _txController._determineTransactionType({
        to: '0x9e673399f795D01116e9A8B2dD2F156705131ee9',
        data: '',
      });
      expect(result).toStrictEqual({
        type: TRANSACTION_TYPES.CONTRACT_INTERACTION,
        getCodeResponse: '0x0a',
      });
    });
  });

  describe('#getPendingTransactions', () => {
    it('should show only submitted and approved transactions as pending transaction', () => {
      txController.txStateManager._addTransactionsToState([
        {
          id: 1,
          status: TRANSACTION_STATUSES.UNAPPROVED,
          metamaskNetworkId: currentNetworkId,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
          },
        },
        {
          id: 2,
          status: TRANSACTION_STATUSES.REJECTED,
          metamaskNetworkId: currentNetworkId,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
          },
          history: [{}],
        },
        {
          id: 3,
          status: TRANSACTION_STATUSES.APPROVED,
          metamaskNetworkId: currentNetworkId,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
          },
          history: [{}],
        },
        {
          id: 4,
          status: TRANSACTION_STATUSES.SIGNED,
          metamaskNetworkId: currentNetworkId,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
          },
          history: [{}],
        },
        {
          id: 5,
          status: TRANSACTION_STATUSES.SUBMITTED,
          metamaskNetworkId: currentNetworkId,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
          },
          history: [{}],
        },
        {
          id: 6,
          status: TRANSACTION_STATUSES.CONFIRMED,
          metamaskNetworkId: currentNetworkId,
          txParams: {
            to: VALID_ADDRESS,
            from: VALID_ADDRESS_TWO,
          },
          history: [{}],
        },
        {
          id: 7,
          status: TRANSACTION_STATUSES.FAILED,
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
      expect(states).toContain(TRANSACTION_STATUSES.APPROVED);
      // 'includes approved',
      expect(states).toContain(TRANSACTION_STATUSES.SUBMITTED);
      // 'includes submitted',
    });
  });

  describe('#_trackTransactionMetricsEvent', () => {
    let trackMetaMetricsEventSpy;

    beforeEach(() => {
      trackMetaMetricsEventSpy = sinon.spy(
        txController,
        '_trackMetaMetricsEvent',
      );
    });

    afterEach(() => {
      trackMetaMetricsEventSpy.restore();
    });

    it('should call _trackMetaMetricsEvent with the correct payload (user source)', () => {
      const txMeta = {
        id: 1,
        status: TRANSACTION_STATUSES.UNAPPROVED,
        txParams: {
          from: fromAccount.address,
          to: '0x1678a085c290ebd122dc42cba69373b5953b831d',
          gasPrice: '0x77359400',
          gas: '0x7b0d',
          nonce: '0x4b',
        },
        type: 'sentEther',
        origin: 'metamask',
        chainId: currentChainId,
        time: 1624408066355,
        metamaskNetworkId: currentNetworkId,
      };
      const expectedPayload = {
        event: 'Transaction Added',
        category: 'Transactions',
        sensitiveProperties: {
          chain_id: '0x2a',
          gas_price: '0x77359400',
          first_seen: 1624408066355,
          network: '42',
          referrer: 'metamask',
          source: 'user',
          status: 'unapproved',
          type: 'sentEther',
        },
      };

      txController._trackTransactionMetricsEvent(
        txMeta,
        TRANSACTION_EVENTS.ADDED,
      );
      expect(trackMetaMetricsEventSpy.callCount).toStrictEqual(1);
      expect(trackMetaMetricsEventSpy.getCall(0).args[0]).toStrictEqual(
        expectedPayload,
      );
    });

    it('should call _trackMetaMetricsEvent with the correct payload (dapp source)', () => {
      const txMeta = {
        id: 1,
        status: TRANSACTION_STATUSES.UNAPPROVED,
        txParams: {
          from: fromAccount.address,
          to: '0x1678a085c290ebd122dc42cba69373b5953b831d',
          gasPrice: '0x77359400',
          gas: '0x7b0d',
          nonce: '0x4b',
        },
        type: 'sentEther',
        origin: 'other',
        chainId: currentChainId,
        time: 1624408066355,
        metamaskNetworkId: currentNetworkId,
      };
      const expectedPayload = {
        event: 'Transaction Added',
        category: 'Transactions',
        sensitiveProperties: {
          chain_id: '0x2a',
          gas_price: '0x77359400',
          first_seen: 1624408066355,
          network: '42',
          referrer: 'other',
          source: 'dapp',
          status: 'unapproved',
          type: 'sentEther',
        },
      };

      txController._trackTransactionMetricsEvent(
        txMeta,
        TRANSACTION_EVENTS.ADDED,
      );
      expect(trackMetaMetricsEventSpy.callCount).toStrictEqual(1);
      expect(trackMetaMetricsEventSpy.getCall(0).args[0]).toStrictEqual(
        expectedPayload,
      );
    });

    it('should call _trackMetaMetricsEvent with the correct payload (extra params)', () => {
      const txMeta = {
        id: 1,
        status: TRANSACTION_STATUSES.UNAPPROVED,
        txParams: {
          from: fromAccount.address,
          to: '0x1678a085c290ebd122dc42cba69373b5953b831d',
          gasPrice: '0x77359400',
          gas: '0x7b0d',
          nonce: '0x4b',
        },
        type: 'sentEther',
        origin: 'other',
        chainId: currentChainId,
        time: 1624408066355,
        metamaskNetworkId: currentNetworkId,
      };
      const expectedPayload = {
        event: 'Transaction Added',
        category: 'Transactions',
        sensitiveProperties: {
          baz: 3.0,
          foo: 'bar',
          chain_id: '0x2a',
          gas_price: '0x77359400',
          first_seen: 1624408066355,
          network: '42',
          referrer: 'other',
          source: 'dapp',
          status: 'unapproved',
          type: 'sentEther',
        },
      };

      txController._trackTransactionMetricsEvent(
        txMeta,
        TRANSACTION_EVENTS.ADDED,
        {
          baz: 3.0,
          foo: 'bar',
        },
      );
      expect(trackMetaMetricsEventSpy.callCount).toStrictEqual(1);
      expect(trackMetaMetricsEventSpy.getCall(0).args[0]).toStrictEqual(
        expectedPayload,
      );
    });
  });
});
