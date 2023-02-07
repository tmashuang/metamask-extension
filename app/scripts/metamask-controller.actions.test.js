/**
 * @jest-environment node
 */

// TODO: Passed but Ganache Spamming
import sinon from 'sinon';
import { ApprovalRequestNotFoundError } from '@metamask/approval-controller';
import { PermissionsRequestNotFoundError } from '@metamask/permission-controller';
import nock from 'nock';
import { ORIGIN_METAMASK } from '../../shared/constants/app';

const Ganache = require('../../test/e2e/ganache');

const ganacheServer = new Ganache();

const browserPolyfillMock = {
  runtime: {
    id: 'fake-extension-id',
    onInstalled: {
      addListener: () => undefined,
    },
    onMessageExternal: {
      addListener: () => undefined,
    },
    getPlatformInfo: async () => 'mac',
  },
  storage: {
    local: {
      get: jest.fn().mockResolvedValue(),
      set: jest.fn().mockResolvedValue(),
    },
  },
};

let loggerMiddlewareMock;
const createLoggerMiddlewareMock = () => (req, res, next) => {
  if (loggerMiddlewareMock) {
    loggerMiddlewareMock.requests.push(req);
    next((cb) => {
      loggerMiddlewareMock.responses.push(res);
      cb();
    });
    return;
  }
  next();
};

const TEST_SEED =
  'debris dizzy just program just float decrease vacant alarm reduce speak stadium';

jest.mock('./lib/createLoggerMiddleware', () => ({
  default: createLoggerMiddlewareMock,
}));

const MetaMaskController = require('./metamask-controller').default;

describe('MetaMaskController', () => {
  let metamaskController;
  const sandbox = sinon.createSandbox();
  const noop = () => undefined;

  beforeAll(async () => {
    await ganacheServer.start();
  });

  beforeEach(() => {
    nock('https://static.metafi.codefi.network')
      .persist()
      .get('/api/v1/lists/eth_phishing_detect_config.json')
      .reply(
        200,
        JSON.stringify({
          version: 2,
          tolerance: 2,
          fuzzylist: [],
          whitelist: [],
          blacklist: ['127.0.0.1'],
        }),
      )
      .get('/api/v1/lists/phishfort_hotlist.json')
      .reply(200, JSON.stringify(['127.0.0.1']));
    metamaskController = new MetaMaskController({
      showUserConfirmation: noop,
      encryptor: {
        encrypt(_, object) {
          this.object = object;
          return Promise.resolve('mock-encrypted');
        },
        decrypt() {
          return Promise.resolve(this.object);
        },
      },
      initLangCode: 'en_US',
      platform: {
        showTransactionNotification: () => undefined,
        getVersion: () => 'foo',
      },
      browser: browserPolyfillMock,
      infuraProjectId: 'foo',
    });
  });

  afterEach(() => {
    sandbox.restore();
    nock.cleanAll();
  });

  afterAll(async () => {
    await ganacheServer.quit();
  });

  describe('#addNewAccount', () => {
    it('two parallel calls with same accountCount give same result', async () => {
      await metamaskController.createNewVaultAndKeychain('test@123');
      const [addNewAccountResult1, addNewAccountResult2] = await Promise.all([
        metamaskController.addNewAccount(1),
        metamaskController.addNewAccount(1),
      ]);
      expect(Object.keys(addNewAccountResult1.identities)).toStrictEqual(
        Object.keys(addNewAccountResult2.identities),
      );
    });

    it('two successive calls with same accountCount give same result', async () => {
      await metamaskController.createNewVaultAndKeychain('test@123');
      const addNewAccountResult1 = await metamaskController.addNewAccount(1);
      const addNewAccountResult2 = await metamaskController.addNewAccount(1);
      expect(Object.keys(addNewAccountResult1.identities)).toStrictEqual(
        Object.keys(addNewAccountResult2.identities),
      );
    });

    it('two successive calls with different accountCount give different results', async () => {
      await metamaskController.createNewVaultAndKeychain('test@123');
      const addNewAccountResult1 = await metamaskController.addNewAccount(1);
      const addNewAccountResult2 = await metamaskController.addNewAccount(2);
      expect(addNewAccountResult1).not.toStrictEqual(addNewAccountResult2);
    });
  });

  describe('#importAccountWithStrategy', () => {
    it('two sequential calls with same strategy give same result', async () => {
      let keyringControllerState1;
      let keyringControllerState2;
      const importPrivkey =
        '4cfd3e90fc78b0f86bf7524722150bb8da9c60cd532564d7ff43f5716514f553';

      await metamaskController.createNewVaultAndKeychain('test@123');
      await Promise.all([
        metamaskController.importAccountWithStrategy('Private Key', [
          importPrivkey,
        ]),
        Promise.resolve(1).then(() => {
          keyringControllerState1 = JSON.stringify(
            metamaskController.keyringController.memStore.getState(),
          );
          metamaskController.importAccountWithStrategy('Private Key', [
            importPrivkey,
          ]);
        }),
        Promise.resolve(2).then(() => {
          keyringControllerState2 = JSON.stringify(
            metamaskController.keyringController.memStore.getState(),
          );
        }),
      ]);
      expect(keyringControllerState1).toStrictEqual(keyringControllerState2);
    });
  });

  describe('#createNewVaultAndRestore', () => {
    it('two successive calls with same inputs give same result', async () => {
      const result1 = await metamaskController.createNewVaultAndRestore(
        'test@123',
        TEST_SEED,
      );
      const result2 = await metamaskController.createNewVaultAndRestore(
        'test@123',
        TEST_SEED,
      );
      expect(result1).toStrictEqual(result2);
    });
  });

  describe('#createNewVaultAndKeychain', () => {
    it('two successive calls with same inputs give same result', async () => {
      const result1 = await metamaskController.createNewVaultAndKeychain(
        'test@123',
      );
      const result2 = await metamaskController.createNewVaultAndKeychain(
        'test@123',
      );
      expect(result1).not.toStrictEqual(undefined);
      expect(result1).toStrictEqual(result2);
    });
  });

  describe('#addToken', () => {
    const address = '0x514910771af9ca656af840dff83e8264ecf986ca';
    const symbol = 'LINK';
    const decimals = 18;

    it('two parallel calls with same token details give same result', async () => {
      const supportsInterfaceStub = sinon
        .stub()
        .returns(Promise.resolve(false));
      sinon
        .stub(metamaskController.tokensController, '_createEthersContract')
        .callsFake(() =>
          Promise.resolve({ supportsInterface: supportsInterfaceStub }),
        );

      const [token1, token2] = await Promise.all([
        metamaskController.getApi().addToken(address, symbol, decimals),
        metamaskController.getApi().addToken(address, symbol, decimals),
      ]);
      expect(token1).toStrictEqual(token2);
    });
  });

  describe('#addCustomNetwork', () => {
    const customRpc = {
      chainId: '0x1',
      chainName: 'DUMMY_CHAIN_NAME',
      rpcUrl: 'DUMMY_RPCURL',
      ticker: 'DUMMY_TICKER',
      blockExplorerUrl: 'DUMMY_EXPLORER',
    };
    it('two successive calls with custom RPC details give same result', async () => {
      await metamaskController.addCustomNetwork(customRpc);
      const rpcList1Length =
        metamaskController.preferencesController.store.getState()
          .frequentRpcListDetail.length;
      await metamaskController.addCustomNetwork(customRpc);
      const rpcList2Length =
        metamaskController.preferencesController.store.getState()
          .frequentRpcListDetail.length;
      expect(rpcList1Length).toStrictEqual(rpcList2Length);
    });
  });

  describe('#updateTransactionSendFlowHistory', () => {
    it('two sequential calls with same history give same result', async () => {
      const recipientAddress = '0xc42edfcc21ed14dda456aa0756c153f7985d8813';

      await metamaskController.createNewVaultAndKeychain('test@123');
      const accounts = await metamaskController.keyringController.getAccounts();
      const txMeta = await metamaskController.getApi().addUnapprovedTransaction(
        undefined,
        {
          from: accounts[0],
          to: recipientAddress,
        },
        ORIGIN_METAMASK,
      );

      const [transaction1, transaction2] = await Promise.all([
        metamaskController
          .getApi()
          .updateTransactionSendFlowHistory(txMeta.id, 2, ['foo1', 'foo2']),
        Promise.resolve(1).then(() =>
          metamaskController
            .getApi()
            .updateTransactionSendFlowHistory(txMeta.id, 2, ['foo1', 'foo2']),
        ),
      ]);
      expect(transaction1).toStrictEqual(transaction2);
    });
  });

  describe('#removePermissionsFor', () => {
    it('should not propagate PermissionsRequestNotFoundError', () => {
      const error = new PermissionsRequestNotFoundError('123');
      metamaskController.permissionController = {
        revokePermissions: () => {
          throw error;
        },
      };
      // Line below will not throw error, in case it throws this test case will fail.
      metamaskController.removePermissionsFor({ subject: 'test_subject' });
    });

    it('should propagate Error other than PermissionsRequestNotFoundError', () => {
      const error = new Error();
      metamaskController.permissionController = {
        revokePermissions: () => {
          throw error;
        },
      };
      expect(() => {
        metamaskController.removePermissionsFor({ subject: 'test_subject' });
      }).toThrow();
    });
  });

  describe('#rejectPermissionsRequest', () => {
    it('should not propagate PermissionsRequestNotFoundError', () => {
      const error = new PermissionsRequestNotFoundError('123');
      metamaskController.permissionController = {
        rejectPermissionsRequest: () => {
          throw error;
        },
      };
      // Line below will not throw error, in case it throws this test case will fail.
      metamaskController.rejectPermissionsRequest('DUMMY_ID');
    });

    it('should propagate Error other than PermissionsRequestNotFoundError', () => {
      const error = new Error();
      metamaskController.permissionController = {
        rejectPermissionsRequest: () => {
          throw error;
        },
      };
      expect(() => {
        metamaskController.rejectPermissionsRequest('DUMMY_ID');
      }).toThrow();
    });
  });

  describe('#acceptPermissionsRequest', () => {
    it('should not propagate PermissionsRequestNotFoundError', () => {
      const error = new PermissionsRequestNotFoundError('123');
      metamaskController.permissionController = {
        acceptPermissionsRequest: () => {
          throw error;
        },
      };
      // Line below will not throw error, in case it throws this test case will fail.
      metamaskController.acceptPermissionsRequest('DUMMY_ID');
    });

    it('should propagate Error other than PermissionsRequestNotFoundError', () => {
      const error = new Error();
      metamaskController.permissionController = {
        acceptPermissionsRequest: () => {
          throw error;
        },
      };
      expect(() => {
        metamaskController.acceptPermissionsRequest('DUMMY_ID');
      }).toThrow();
    });
  });

  describe('#resolvePendingApproval', () => {
    it('should not propagate ApprovalRequestNotFoundError', () => {
      const error = new ApprovalRequestNotFoundError('123');
      metamaskController.approvalController = {
        accept: () => {
          throw error;
        },
      };
      // Line below will not throw error, in case it throws this test case will fail.
      metamaskController.resolvePendingApproval('DUMMY_ID', 'DUMMY_VALUE');
    });

    it('should propagate Error other than ApprovalRequestNotFoundError', () => {
      const error = new Error();
      metamaskController.approvalController = {
        accept: () => {
          throw error;
        },
      };
      expect(() => {
        metamaskController.resolvePendingApproval('DUMMY_ID', 'DUMMY_VALUE');
      }).toThrow();
    });
  });

  describe('#rejectPendingApproval', () => {
    it('should not propagate ApprovalRequestNotFoundError', () => {
      const error = new ApprovalRequestNotFoundError('123');
      metamaskController.approvalController = {
        reject: () => {
          throw error;
        },
      };
      // Line below will not throw error, in case it throws this test case will fail.
      metamaskController.rejectPendingApproval('DUMMY_ID', {
        code: 1,
        message: 'DUMMY_MESSAGE',
        data: 'DUMMY_DATA',
      });
    });

    it('should propagate Error other than ApprovalRequestNotFoundError', () => {
      const error = new Error();
      metamaskController.approvalController = {
        reject: () => {
          throw error;
        },
      };
      expect(() => {
        metamaskController.rejectPendingApproval('DUMMY_ID', {
          code: 1,
          message: 'DUMMY_MESSAGE',
          data: 'DUMMY_DATA',
        });
      }).toThrow();
    });
  });
});
