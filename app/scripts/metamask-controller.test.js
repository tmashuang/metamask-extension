/**
 * @jest-environment node
 */
// TODO: Passed but Ganache Spam Logging
import sinon from 'sinon';
import { cloneDeep } from 'lodash';
import nock from 'nock';
import { obj as createThoughStream } from 'through2';
import EthQuery from 'eth-query';
import browser from 'webextension-polyfill';
import { wordlist as englishWordlist } from '@metamask/scure-bip39/dist/wordlists/english';
import { TransactionStatus } from '../../shared/constants/transaction';
import createTxMeta from '../../test/lib/createTxMeta';
import { NETWORK_TYPES } from '../../shared/constants/network';
import {
  HardwareDeviceNames,
  HardwareKeyringTypes,
} from '../../shared/constants/hardware-wallets';
import { createTestProviderTools } from '../../test/stub/provider';
import { deferredPromise } from './lib/util';
import MetaMaskController from './metamask-controller';

const currentNetworkId = '5';
const providerResultStub = {
  // 1 gwei
  eth_gasPrice: '0x0de0b6b3a7640000',
  // by default, all accounts are external accounts (not contracts)
  eth_getCode: '0x',
};
const { provider } = createTestProviderTools({
  scaffold: providerResultStub,
  networkId: currentNetworkId,
  chainId: currentNetworkId,
});
const Ganache = require('../../test/e2e/ganache');

const NOTIFICATION_ID = 'NHL8f2eSSTn9TKBamRLiU';

const firstTimeState = {
  config: {},
  NetworkController: {
    provider: {
      type: NETWORK_TYPES.RPC,
      rpcUrl: 'http://localhost:8545',
      chainId: '0x539',
    },
    networkDetails: {
      EIPS: {
        1559: false,
      },
    },
  },
  NotificationController: {
    notifications: {
      [NOTIFICATION_ID]: {
        id: NOTIFICATION_ID,
        origin: 'local:http://localhost:8086/',
        createdDate: 1652967897732,
        readDate: null,
        message: 'Hello, http://localhost:8086!',
      },
    },
  },
};

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
};

let loggerMiddlewareMock;
const initializeMockMiddlewareLog = () => {
  loggerMiddlewareMock = {
    requests: [],
    responses: [],
  };
};
const tearDownMockMiddlewareLog = () => {
  loggerMiddlewareMock = undefined;
};

const mockCreateLoggerMiddleware = () => (req, res, next) => {
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

jest.mock('./lib/createLoggerMiddleware', () => ({
  __esModule: true,
  default: () => mockCreateLoggerMiddleware,
}));

const DEFAULT_LABEL = 'Account 1';
const TEST_SEED =
  'debris dizzy just program just float decrease vacant alarm reduce speak stadium';
const TEST_ADDRESS = '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc';
const TEST_ADDRESS_2 = '0xec1adf982415d2ef5ec55899b9bfb8bc0f29251b';
const TEST_ADDRESS_3 = '0xeb9e64b93097bc15f01f13eae97015c57ab64823';
const TEST_SEED_ALT =
  'setup olympic issue mobile velvet surge alcohol burger horse view reopen gentle';
const TEST_ADDRESS_ALT = '0xc42edfcc21ed14dda456aa0756c153f7985d8813';
const CUSTOM_RPC_URL = 'http://localhost:8545';
const CUSTOM_RPC_CHAIN_ID = '0x539';

function getMockBlockTracker() {
  return {
    addListener: sinon.stub().callsArgWithAsync(1, '0xa'),
    removeListener: sinon.spy(),
    testProperty: 'fakeBlockTracker',
    getCurrentBlock: () => '0xa',
  };
}

const flushPromises = () => new Promise((resolve) => process.nextTick(resolve));

describe('Name of the group', () => {
  beforeAll(async () => {
    await ganacheServer.start();
  });
  // afterAll(async () => {
  //   await ganacheServer.quit();
  // })
  it('should', async () => {
    const noop = () => undefined;

    const metamaskController = new MetaMaskController({
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
      // initState: cloneDeep(firstTimeState),
      provider,
      // blockTracker: getMockBlockTracker,
      initLangCode: 'en_US',
      platform: {
        showTransactionNotification: () => undefined,
        getVersion: () => 'foo',
      },
      browser: browserPolyfillMock,
      infuraProjectId: 'foo',
    });

    await flushPromises();

    jest.useFakeTimers(); // Does work when its placed here
  });
});

describe.skip('MetaMaskController', () => {
  let metamaskController;

  const sandbox = sinon.createSandbox();
  const noop = () => undefined;

  beforeAll(async () => {
    globalThis.isFirstTimeProfileLoaded = true;
    await ganacheServer.start();
    sinon.spy(MetaMaskController.prototype, 'resetStates');
  });

  beforeEach(() => {
    nock('https://min-api.cryptocompare.com')
      .persist()
      .get(/.*/u)
      .reply(200, '{"JPY":12415.9}');
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

    sandbox.replace(browser, 'runtime', {
      sendMessage: sandbox.stub().rejects(),
    });

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
      initState: cloneDeep(firstTimeState),
      initLangCode: 'en_US',
      platform: {
        showTransactionNotification: () => undefined,
        getVersion: () => 'foo',
      },
      browser: browserPolyfillMock,
      infuraProjectId: 'foo',
    });

    // add sinon method spies
    sandbox.spy(
      metamaskController.keyringController,
      'createNewVaultAndKeychain',
    );
    sandbox.spy(
      metamaskController.keyringController,
      'createNewVaultAndRestore',
    );
  });

  afterEach(() => {
    nock.cleanAll();
    sandbox.restore();
  });

  afterAll(async () => {
    await ganacheServer.quit();
  });

  describe('should reset states on first time profile load', () => {
    it('should reset state', () => {
      expect(metamaskController.resetStates.calledOnce).toBeTruthy();
      expect(globalThis.isFirstTimeProfileLoaded).toStrictEqual(false);
    });

    it('should not reset states if already set', () => {
      // global.isFirstTime should also remain false
      expect(globalThis.isFirstTimeProfileLoaded).toStrictEqual(false);
    });
  });

  describe('#importAccountWithStrategy', () => {
    const importPrivkey =
      '4cfd3e90fc78b0f86bf7524722150bb8da9c60cd532564d7ff43f5716514f553';

    beforeEach(async () => {
      const password = 'a-fake-password';
      await metamaskController.createNewVaultAndRestore(password, TEST_SEED);
      await metamaskController.importAccountWithStrategy('Private Key', [
        importPrivkey,
      ]);
    });

    it('adds private key to keyrings in KeyringController', async () => {
      const simpleKeyrings =
        metamaskController.keyringController.getKeyringsByType(
          HardwareKeyringTypes.imported,
        );
      const pubAddressHexArr = await simpleKeyrings[0].getAccounts();
      const privKeyHex = await simpleKeyrings[0].exportAccount(
        pubAddressHexArr[0],
      );
      expect(privKeyHex).toStrictEqual(importPrivkey);
      expect(pubAddressHexArr[0]).toStrictEqual(
        '0xe18035bf8712672935fdb4e5e431b1a0183d2dfc',
      );
    });

    it('adds 1 account', async () => {
      const keyringAccounts =
        await metamaskController.keyringController.getAccounts();
      expect(keyringAccounts[keyringAccounts.length - 1]).toStrictEqual(
        '0xe18035bf8712672935fdb4e5e431b1a0183d2dfc',
      );
    });
  });

  describe('submitPassword', () => {
    it('removes any identities that do not correspond to known accounts.', async () => {
      const password = 'password';
      await metamaskController.createNewVaultAndKeychain(password);

      const fakeAddress = '0xbad0';
      metamaskController.preferencesController.addAddresses([fakeAddress]);
      await metamaskController.submitPassword(password);

      const identities = Object.keys(
        metamaskController.preferencesController.store.getState().identities,
      );
      const addresses =
        await metamaskController.keyringController.getAccounts();

      identities.forEach((identity) => {
        expect(addresses.includes(identity)).toBeTruthy();
      });

      addresses.forEach((address) => {
        expect(identities.includes(address)).toBeTruthy();
      });
    });
  });

  describe('#createNewVaultAndKeychain', () => {
    it('can only create new vault on keyringController once', async () => {
      const selectStub = sandbox.stub(
        metamaskController,
        'selectFirstIdentity',
      );

      const password = 'a-fake-password';

      await metamaskController.createNewVaultAndKeychain(password);
      await metamaskController.createNewVaultAndKeychain(password);

      expect(
        metamaskController.keyringController.createNewVaultAndKeychain
          .calledOnce,
      ).toBeTruthy();

      selectStub.reset();
    });
  });

  describe('#createNewVaultAndRestore', () => {
    it('should be able to call newVaultAndRestore despite a mistake.', async () => {
      const password = 'what-what-what';
      sandbox.stub(metamaskController, 'getBalance');
      metamaskController.getBalance.callsFake(() => {
        return Promise.resolve('0x0');
      });

      await metamaskController
        .createNewVaultAndRestore(password, TEST_SEED.slice(0, -1))
        .catch(() => null);
      await metamaskController.createNewVaultAndRestore(password, TEST_SEED);

      expect(
        metamaskController.keyringController.createNewVaultAndRestore
          .calledTwice,
      ).toBeTruthy();
    });

    it('should clear previous identities after vault restoration', async () => {
      sandbox.stub(metamaskController, 'getBalance');
      metamaskController.getBalance.callsFake(() => {
        return Promise.resolve('0x0');
      });

      let startTime = Date.now();
      await metamaskController.createNewVaultAndRestore(
        'foobar1337',
        TEST_SEED,
      );
      let endTime = Date.now();

      const firstVaultIdentities = cloneDeep(
        metamaskController.getState().identities,
      );
      expect(
        firstVaultIdentities[TEST_ADDRESS].lastSelected >= startTime &&
          firstVaultIdentities[TEST_ADDRESS].lastSelected <= endTime,
      ).toBeTruthy();
      delete firstVaultIdentities[TEST_ADDRESS].lastSelected;
      expect(firstVaultIdentities).toStrictEqual({
        [TEST_ADDRESS]: { address: TEST_ADDRESS, name: DEFAULT_LABEL },
      });

      await metamaskController.preferencesController.setAccountLabel(
        TEST_ADDRESS,
        'Account Foo',
      );

      const labelledFirstVaultIdentities = cloneDeep(
        metamaskController.getState().identities,
      );
      delete labelledFirstVaultIdentities[TEST_ADDRESS].lastSelected;
      expect(labelledFirstVaultIdentities).toStrictEqual({
        [TEST_ADDRESS]: { address: TEST_ADDRESS, name: 'Account Foo' },
      });

      startTime = Date.now();
      await metamaskController.createNewVaultAndRestore(
        'foobar1337',
        TEST_SEED_ALT,
      );
      endTime = Date.now();

      const secondVaultIdentities = cloneDeep(
        metamaskController.getState().identities,
      );
      expect(
        secondVaultIdentities[TEST_ADDRESS_ALT].lastSelected >= startTime &&
          secondVaultIdentities[TEST_ADDRESS_ALT].lastSelected <= endTime,
      ).toBeTruthy();
      delete secondVaultIdentities[TEST_ADDRESS_ALT].lastSelected;
      expect(secondVaultIdentities).toStrictEqual({
        [TEST_ADDRESS_ALT]: { address: TEST_ADDRESS_ALT, name: DEFAULT_LABEL },
      });
    });

    it('should restore any consecutive accounts with balances without extra zero balance accounts', async () => {
      sandbox.stub(metamaskController, 'getBalance');
      metamaskController.getBalance.withArgs(TEST_ADDRESS).callsFake(() => {
        return Promise.resolve('0x14ced5122ce0a000');
      });
      metamaskController.getBalance.withArgs(TEST_ADDRESS_2).callsFake(() => {
        return Promise.resolve('0x0');
      });
      metamaskController.getBalance.withArgs(TEST_ADDRESS_3).callsFake(() => {
        return Promise.resolve('0x14ced5122ce0a000');
      });

      const startTime = Date.now();
      await metamaskController.createNewVaultAndRestore(
        'foobar1337',
        TEST_SEED,
      );

      const identities = cloneDeep(metamaskController.getState().identities);
      expect(
        identities[TEST_ADDRESS].lastSelected >= startTime &&
          identities[TEST_ADDRESS].lastSelected <= Date.now(),
      ).toBeTruthy();
      delete identities[TEST_ADDRESS].lastSelected;
      expect(identities).toStrictEqual({
        [TEST_ADDRESS]: { address: TEST_ADDRESS, name: DEFAULT_LABEL },
      });
    });
  });

  describe('#getBalance', () => {
    it('should return the balance known by accountTracker', async () => {
      const accounts = {};
      const balance = '0x14ced5122ce0a000';
      accounts[TEST_ADDRESS] = { balance };

      metamaskController.accountTracker.store.putState({ accounts });

      const gotten = await metamaskController.getBalance(TEST_ADDRESS);

      expect(balance).toStrictEqual(gotten);
    });

    it('should ask the network for a balance when not known by accountTracker', async () => {
      const accounts = {};
      const balance = '0x14ced5122ce0a000';
      const ethQuery = new EthQuery();
      sinon.stub(ethQuery, 'getBalance').callsFake((_, callback) => {
        callback(undefined, balance);
      });

      metamaskController.accountTracker.store.putState({ accounts });

      const gotten = await metamaskController.getBalance(
        TEST_ADDRESS,
        ethQuery,
      );

      expect(balance).toStrictEqual(gotten);
    });
  });

  describe('#getApi', () => {
    it('getState', () => {
      const getApi = metamaskController.getApi();
      const state = getApi.getState();
      expect(state).toStrictEqual(metamaskController.getState());
    });
  });

  describe('#selectFirstIdentity', () => {
    let identities, address;

    beforeEach(() => {
      address = '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc';
      identities = {
        '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc': {
          address,
          name: 'Account 1',
        },
        '0xc42edfcc21ed14dda456aa0756c153f7985d8813': {
          address: '0xc42edfcc21ed14dda456aa0756c153f7985d8813',
          name: 'Account 2',
        },
      };
      metamaskController.preferencesController.store.updateState({
        identities,
      });
      metamaskController.selectFirstIdentity();
    });

    it('changes preferences controller select address', () => {
      const preferenceControllerState =
        metamaskController.preferencesController.store.getState();
      expect(preferenceControllerState.selectedAddress).toStrictEqual(address);
    });

    it('changes metamask controller selected address', () => {
      const metamaskState = metamaskController.getState();
      expect(metamaskState.selectedAddress).toStrictEqual(address);
    });
  });

  describe('connectHardware', () => {
    it('should throw if it receives an unknown device name', async () => {
      try {
        await metamaskController.connectHardware(
          'Some random device name',
          0,
          `m/44/0'/0'`,
        );
      } catch (e) {
        expect(e.message).toStrictEqual(
          'MetamaskController:getKeyringForDevice - Unknown device',
        );
      }
    });

    it('should add the Trezor Hardware keyring', async () => {
      sinon.spy(metamaskController.keyringController, 'addNewKeyring');
      await metamaskController
        .connectHardware(HardwareDeviceNames.trezor, 0)
        .catch(() => null);
      const keyrings =
        await metamaskController.keyringController.getKeyringsByType(
          HardwareKeyringTypes.trezor,
        );
      expect(
        metamaskController.keyringController.addNewKeyring.getCall(0).args,
      ).toStrictEqual([HardwareKeyringTypes.trezor]);
      expect(keyrings).toHaveLength(1);
    });

    it('should add the Ledger Hardware keyring', async () => {
      sinon.spy(metamaskController.keyringController, 'addNewKeyring');
      await metamaskController
        .connectHardware(HardwareDeviceNames.ledger, 0)
        .catch(() => null);
      const keyrings =
        await metamaskController.keyringController.getKeyringsByType(
          HardwareKeyringTypes.ledger,
        );
      expect(
        metamaskController.keyringController.addNewKeyring.getCall(0).args,
      ).toStrictEqual([HardwareKeyringTypes.ledger]);
      expect(keyrings).toHaveLength(1);
    });
  });

  describe('getPrimaryKeyringMnemonic', function () {
    it('should return a mnemonic as a Uint8Array', function () {
      const mockMnemonic =
        'above mercy benefit hospital call oval domain student sphere interest argue shock';
      const mnemonicIndices = mockMnemonic
        .split(' ')
        .map((word) => englishWordlist.indexOf(word));
      const uint8ArrayMnemonic = new Uint8Array(
        new Uint16Array(mnemonicIndices).buffer,
      );

      const mockHDKeyring = {
        type: 'HD Key Tree',
        mnemonic: uint8ArrayMnemonic,
      };
      sinon
        .stub(metamaskController.keyringController, 'getKeyringsByType')
        .returns([mockHDKeyring]);

      const recoveredMnemonic = metamaskController.getPrimaryKeyringMnemonic();

      expect(recoveredMnemonic).toStrictEqual(uint8ArrayMnemonic);
    });
  });

  describe('checkHardwareStatus', function () {
    it('should throw if it receives an unknown device name', async function () {
      try {
        await metamaskController.checkHardwareStatus(
          'Some random device name',
          `m/44/0'/0'`,
        );
      } catch (e) {
        expect(e.message).toStrictEqual(
          'MetamaskController:getKeyringForDevice - Unknown device',
        );
      }
    });

    it('should be locked by default', async () => {
      await metamaskController
        .connectHardware(HardwareDeviceNames.trezor, 0)
        .catch(() => null);
      const status = await metamaskController.checkHardwareStatus(
        HardwareDeviceNames.trezor,
      );
      expect(status).toStrictEqual(false);
    });
  });

  describe('forgetDevice', () => {
    it('should throw if it receives an unknown device name', async () => {
      try {
        await metamaskController.forgetDevice('Some random device name');
      } catch (e) {
        expect(e.message).toStrictEqual(
          'MetamaskController:getKeyringForDevice - Unknown device',
        );
      }
    });

    it('should wipe all the keyring info', async () => {
      await metamaskController
        .connectHardware(HardwareDeviceNames.trezor, 0)
        .catch(() => null);
      await metamaskController.forgetDevice(HardwareDeviceNames.trezor);
      const keyrings =
        await metamaskController.keyringController.getKeyringsByType(
          HardwareKeyringTypes.trezor,
        );

      expect(keyrings[0].accounts).toStrictEqual([]);
      expect(keyrings[0].page).toStrictEqual(0);
      expect(keyrings[0].isUnlocked()).toStrictEqual(false);
    });
  });

  describe('unlockHardwareWalletAccount', () => {
    let accountToUnlock;
    let windowOpenStub;
    let addNewAccountStub;
    let getAccountsStub;
    beforeEach(async () => {
      accountToUnlock = 10;
      windowOpenStub = sinon.stub(window, 'open');
      windowOpenStub.returns(noop);

      addNewAccountStub = sinon.stub(
        metamaskController.keyringController,
        'addNewAccount',
      );
      addNewAccountStub.returns({});

      getAccountsStub = sinon.stub(
        metamaskController.keyringController,
        'getAccounts',
      );
      // Need to return different address to mock the behavior of
      // adding a new account from the keyring
      getAccountsStub.onCall(0).returns(Promise.resolve(['0x1']));
      getAccountsStub.onCall(1).returns(Promise.resolve(['0x2']));
      getAccountsStub.onCall(2).returns(Promise.resolve(['0x3']));
      getAccountsStub.onCall(3).returns(Promise.resolve(['0x4']));
      sinon.spy(metamaskController.preferencesController, 'setAddresses');
      sinon.spy(metamaskController.preferencesController, 'setSelectedAddress');
      sinon.spy(metamaskController.preferencesController, 'setAccountLabel');
      await metamaskController
        .connectHardware(HardwareDeviceNames.trezor, 0, `m/44'/1'/0'/0`)
        .catch(() => null);
      await metamaskController.unlockHardwareWalletAccount(
        accountToUnlock,
        HardwareDeviceNames.trezor,
        `m/44'/1'/0'/0`,
      );
    });

    afterEach(() => {
      window.open.restore();
      metamaskController.keyringController.addNewAccount.restore();
      metamaskController.keyringController.getAccounts.restore();
      metamaskController.preferencesController.setAddresses.restore();
      metamaskController.preferencesController.setSelectedAddress.restore();
      metamaskController.preferencesController.setAccountLabel.restore();
    });

    it('should set unlockedAccount in the keyring', async () => {
      const keyrings =
        await metamaskController.keyringController.getKeyringsByType(
          HardwareKeyringTypes.trezor,
        );
      expect(keyrings[0].unlockedAccount).toStrictEqual(accountToUnlock);
    });

    it('should call keyringController.addNewAccount', async () => {
      expect(
        metamaskController.keyringController.addNewAccount.calledOnce,
      ).toBeTruthy();
    });

    it('should call keyringController.getAccounts', async () => {
      expect(
        metamaskController.keyringController.getAccounts.called,
      ).toBeTruthy();
    });

    it('should call preferencesController.setAddresses', async () => {
      expect(
        metamaskController.preferencesController.setAddresses.calledOnce,
      ).toBeTruthy();
    });

    it('should call preferencesController.setSelectedAddress', async () => {
      expect(
        metamaskController.preferencesController.setSelectedAddress.calledOnce,
      ).toBeTruthy();
    });

    it('should call preferencesController.setAccountLabel', async () => {
      expect(
        metamaskController.preferencesController.setAccountLabel.calledOnce,
      ).toBeTruthy();
    });
  });

  describe('#setCustomRpc', () => {
    it('returns custom RPC that when called', async () => {
      const rpcUrl = await metamaskController.setCustomRpc(
        CUSTOM_RPC_URL,
        CUSTOM_RPC_CHAIN_ID,
      );
      expect(rpcUrl).toStrictEqual(CUSTOM_RPC_URL);
    });

    it('changes the network controller rpc', async () => {
      await metamaskController.setCustomRpc(
        CUSTOM_RPC_URL,
        CUSTOM_RPC_CHAIN_ID,
      );
      const networkControllerState =
        metamaskController.networkController.store.getState();
      expect(networkControllerState.provider.rpcUrl).toStrictEqual(
        CUSTOM_RPC_URL,
      );
    });
  });

  describe('#addNewAccount', () => {
    it('errors when an primary keyring is does not exist', async () => {
      const addNewAccount = metamaskController.addNewAccount();

      try {
        await addNewAccount;
        expect(false).toBe(true);
      } catch (e) {
        expect(e.message).toStrictEqual(
          'MetamaskController - No HD Key Tree found',
        );
      }
    });
  });

  describe('#verifyseedPhrase', () => {
    it('errors when no keying is provided', async () => {
      try {
        await metamaskController.verifySeedPhrase();
      } catch (error) {
        expect(error.message).toStrictEqual(
          'MetamaskController - No HD Key Tree found',
        );
      }
    });

    it('#addNewAccount', async () => {
      await metamaskController.addNewAccount(1);
      const getAccounts =
        await metamaskController.keyringController.getAccounts();
      expect(getAccounts).toHaveLength(2);
    });
  });

  describe('#resetAccount', () => {
    it('wipes transactions from only the correct network id and with the selected address', async () => {
      const selectedAddressStub = sinon.stub(
        metamaskController.preferencesController,
        'getSelectedAddress',
      );
      const getNetworkstub = sinon.stub(
        metamaskController.txController.txStateManager,
        'getNetworkState',
      );

      selectedAddressStub.returns('0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc');
      getNetworkstub.returns(42);

      metamaskController.txController.txStateManager._addTransactionsToState([
        createTxMeta({
          id: 1,
          status: TransactionStatus.unapproved,
          metamaskNetworkId: currentNetworkId,
          txParams: { from: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc' },
        }),
        createTxMeta({
          id: 1,
          status: TransactionStatus.unapproved,
          metamaskNetworkId: currentNetworkId,
          txParams: { from: '0x0dcd5d886577d5081b0c52e242ef29e70be3e7bc' },
        }),
        createTxMeta({
          id: 2,
          status: TransactionStatus.rejected,
          metamaskNetworkId: '32',
        }),
        createTxMeta({
          id: 3,
          status: TransactionStatus.submitted,
          metamaskNetworkId: currentNetworkId,
          txParams: { from: '0xB09d8505E1F4EF1CeA089D47094f5DD3464083d4' },
        }),
      ]);

      await metamaskController.resetAccount();
      expect(
        metamaskController.txController.txStateManager.getTransaction(1),
      ).toStrictEqual(undefined);
    });
  });

  describe('#removeAccount', () => {
    let ret;
    const addressToRemove = '0x1';
    let mockKeyring;

    beforeEach(async () => {
      mockKeyring = {
        getAccounts: sinon.stub().returns(Promise.resolve([])),
        destroy: sinon.stub(),
      };
      sinon.stub(metamaskController.preferencesController, 'removeAddress');
      sinon.stub(metamaskController.accountTracker, 'removeAccount');
      sinon.stub(metamaskController.keyringController, 'removeAccount');
      sinon.stub(metamaskController, 'removeAllAccountPermissions');
      sinon
        .stub(metamaskController.keyringController, 'getKeyringForAccount')
        .returns(Promise.resolve(mockKeyring));

      ret = await metamaskController.removeAccount(addressToRemove);
    });

    afterEach(() => {
      metamaskController.keyringController.removeAccount.restore();
      metamaskController.accountTracker.removeAccount.restore();
      metamaskController.preferencesController.removeAddress.restore();
      metamaskController.removeAllAccountPermissions.restore();

      mockKeyring.getAccounts.resetHistory();
      mockKeyring.destroy.resetHistory();
    });

    it('should call preferencesController.removeAddress', async () => {
      expect(
        metamaskController.preferencesController.removeAddress.calledWith(
          addressToRemove,
        ),
      ).toBeTruthy();
    });
    it('should call accountTracker.removeAccount', async () => {
      expect(
        metamaskController.accountTracker.removeAccount.calledWith([
          addressToRemove,
        ]),
      ).toBeTruthy();
    });
    it('should call keyringController.removeAccount', async () => {
      expect(
        metamaskController.keyringController.removeAccount.calledWith(
          addressToRemove,
        ),
      ).toBeTruthy();
    });
    it('should call metamaskController.removeAllAccountPermissions', async () => {
      expect(
        metamaskController.removeAllAccountPermissions.calledWith(
          addressToRemove,
        ),
      ).toBeTruthy();
    });
    it('should return address', async () => {
      expect(ret).toStrictEqual('0x1');
    });
    it('should call keyringController.getKeyringForAccount', async () => {
      expect(
        metamaskController.keyringController.getKeyringForAccount.calledWith(
          addressToRemove,
        ),
      ).toBeTruthy();
    });
    it('should call keyring.destroy', async () => {
      expect(mockKeyring.destroy.calledOnce).toBeTruthy();
    });
  });

  describe('#newUnsignedMessage', () => {
    let msgParams, metamaskMsgs, messages, msgId;

    const address = '0xc42edfcc21ed14dda456aa0756c153f7985d8813';
    const data =
      '0x0000000000000000000000000000000000000043727970746f6b697474696573';

    beforeEach(async () => {
      sandbox.stub(metamaskController, 'getBalance');
      metamaskController.getBalance.callsFake(() => {
        return Promise.resolve('0x0');
      });

      await metamaskController.createNewVaultAndRestore(
        'foobar1337',
        TEST_SEED_ALT,
      );

      msgParams = {
        from: address,
        data,
      };

      metamaskController.preferencesController.setDisabledRpcMethodPreference(
        'eth_sign',
        true,
      );
      const promise = metamaskController.newUnsignedMessage(msgParams);
      // handle the promise so it doesn't throw an unhandledRejection
      promise.then(noop).catch(noop);

      metamaskMsgs = metamaskController.messageManager.getUnapprovedMsgs();
      messages = metamaskController.messageManager.messages;
      msgId = Object.keys(metamaskMsgs)[0];
      messages[0].msgParams.metamaskId = parseInt(msgId, 10);
    });

    it('persists address from msg params', () => {
      expect(metamaskMsgs[msgId].msgParams.from).toStrictEqual(address);
    });

    it('persists data from msg params', () => {
      expect(metamaskMsgs[msgId].msgParams.data).toStrictEqual(data);
    });

    it('sets the status to unapproved', () => {
      expect(metamaskMsgs[msgId].status).toStrictEqual(
        TransactionStatus.unapproved,
      );
    });

    it('sets the type to eth_sign', () => {
      expect(metamaskMsgs[msgId].type).toStrictEqual('eth_sign');
    });

    it('rejects the message', () => {
      const msgIdInt = parseInt(msgId, 10);
      metamaskController.cancelMessage(msgIdInt, noop);
      expect(messages[0].status).toStrictEqual(TransactionStatus.rejected);
    });

    it('checks message length', async () => {
      msgParams = {
        from: address,
        data: '0xDEADBEEF',
      };

      try {
        await metamaskController.newUnsignedMessage(msgParams);
      } catch (error) {
        expect(error.message).toStrictEqual(
          'eth_sign requires 32 byte message hash',
        );
      }
    });

    it('errors when signing a message', async () => {
      try {
        await metamaskController.signMessage(messages[0].msgParams);
      } catch (error) {
        expect(error.message).toStrictEqual(
          'Expected message to be an Uint8Array with length 32',
        );
      }
    });
  });

  describe('#newUnsignedPersonalMessage', () => {
    let msgParams, metamaskPersonalMsgs, personalMessages, msgId;

    const address = '0xc42edfcc21ed14dda456aa0756c153f7985d8813';
    const data = '0x43727970746f6b697474696573';

    beforeEach(async () => {
      sandbox.stub(metamaskController, 'getBalance');
      metamaskController.getBalance.callsFake(() => {
        return Promise.resolve('0x0');
      });

      await metamaskController.createNewVaultAndRestore(
        'foobar1337',
        TEST_SEED_ALT,
      );

      msgParams = {
        from: address,
        data,
      };

      const promise = metamaskController.newUnsignedPersonalMessage(msgParams);
      // handle the promise so it doesn't throw an unhandledRejection
      promise.then(noop).catch(noop);

      metamaskPersonalMsgs =
        metamaskController.personalMessageManager.getUnapprovedMsgs();
      personalMessages = metamaskController.personalMessageManager.messages;
      msgId = Object.keys(metamaskPersonalMsgs)[0];
      personalMessages[0].msgParams.metamaskId = parseInt(msgId, 10);
    });

    it('errors with no from in msgParams', async () => {
      try {
        await metamaskController.newUnsignedPersonalMessage({
          data,
        });
        expect(false).toBe(true);
      } catch (error) {
        expect(error.message).toStrictEqual(
          'MetaMask Message Signature: from field is required.',
        );
      }
    });

    it('persists address from msg params', () => {
      expect(metamaskPersonalMsgs[msgId].msgParams.from).toStrictEqual(address);
    });

    it('persists data from msg params', () => {
      expect(metamaskPersonalMsgs[msgId].msgParams.data).toStrictEqual(data);
    });

    it('sets the status to unapproved', () => {
      expect(metamaskPersonalMsgs[msgId].status).toStrictEqual(
        TransactionStatus.unapproved,
      );
    });

    it('sets the type to personal_sign', () => {
      expect(metamaskPersonalMsgs[msgId].type).toStrictEqual('personal_sign');
    });

    it('rejects the message', () => {
      const msgIdInt = parseInt(msgId, 10);
      metamaskController.cancelPersonalMessage(msgIdInt, noop);
      expect(personalMessages[0].status).toStrictEqual(
        TransactionStatus.rejected,
      );
    });

    it('errors when signing a message', async () => {
      await metamaskController.signPersonalMessage(
        personalMessages[0].msgParams,
      );
      expect(metamaskPersonalMsgs[msgId].status).toStrictEqual(
        TransactionStatus.signed,
      );
      expect(metamaskPersonalMsgs[msgId].rawSig).toStrictEqual(
        '0x6a1b65e2b8ed53cf398a769fad24738f9fbe29841fe6854e226953542c4b6a173473cb152b6b1ae5f06d601d45dd699a129b0a8ca84e78b423031db5baa734741b',
      );
    });
  });

  describe('#setupUntrustedCommunication', () => {
    const mockTxParams = { from: TEST_ADDRESS };

    beforeEach(() => {
      initializeMockMiddlewareLog();
    });

    afterAll(() => {
      tearDownMockMiddlewareLog();
    });

    it('sets up phishing stream for untrusted communication', async () => {
      const phishingMessageSender = {
        url: 'http://myethereumwalletntw.com',
        tab: {},
      };

      const { promise, resolve } = deferredPromise();
      const streamTest = createThoughStream((chunk, _, cb) => {
        if (chunk.name !== 'phishing') {
          cb();
          return;
        }
        expect(chunk.data.hostname).toStrictEqual(
          new URL(phishingMessageSender.url).hostname,
        );
        resolve();
        cb();
      });

      metamaskController.setupUntrustedCommunication({
        connectionStream: streamTest,
        sender: phishingMessageSender,
      });
      await promise;
      streamTest.end();
    });

    it('adds a tabId and origin to requests', (done) => {
      const messageSender = {
        url: 'http://mycrypto.com',
        tab: { id: 456 },
      };
      const streamTest = createThoughStream((chunk, _, cb) => {
        if (chunk.data && chunk.data.method) {
          cb(null, chunk);
          return;
        }
        cb();
      });

      metamaskController.setupUntrustedCommunication({
        connectionStream: streamTest,
        sender: messageSender,
      });

      const message = {
        id: 1999133338649204,
        jsonrpc: '2.0',
        params: [{ ...mockTxParams }],
        method: 'eth_sendTransaction',
      };
      streamTest.write(
        {
          name: 'metamask-provider',
          data: message,
        },
        null,
        () => {
          setTimeout(() => {
            expect(loggerMiddlewareMock.requests[0]).toStrictEqual({
              ...message,
              origin: 'http://mycrypto.com',
              tabId: 456,
            });
            done();
          });
        },
      );
    });

    it('should add only origin to request if tabId not provided', (done) => {
      const messageSender = {
        url: 'http://mycrypto.com',
      };
      const streamTest = createThoughStream((chunk, _, cb) => {
        if (chunk.data && chunk.data.method) {
          cb(null, chunk);
          return;
        }
        cb();
      });

      metamaskController.setupUntrustedCommunication({
        connectionStream: streamTest,
        sender: messageSender,
      });

      const message = {
        id: 1999133338649204,
        jsonrpc: '2.0',
        params: [{ ...mockTxParams }],
        method: 'eth_sendTransaction',
      };
      streamTest.write(
        {
          name: 'metamask-provider',
          data: message,
        },
        null,
        () => {
          setTimeout(() => {
            expect(loggerMiddlewareMock.requests[0]).toStrictEqual({
              ...message,
              origin: 'http://mycrypto.com',
            });
            done();
          });
        },
      );
    });
  });

  describe('#setupTrustedCommunication', () => {
    it('sets up controller JSON-RPC api for trusted communication', async () => {
      const messageSender = {
        url: 'http://mycrypto.com',
        tab: {},
      };
      const { promise, resolve } = deferredPromise();
      const streamTest = createThoughStream((chunk, _, cb) => {
        expect(chunk.name).toStrictEqual('controller');
        resolve();
        cb();
      });

      metamaskController.setupTrustedCommunication(streamTest, messageSender);
      await promise;
      streamTest.end();
    });
  });

  describe('#markPasswordForgotten', () => {
    it('adds and sets forgottenPassword to config data to true', () => {
      metamaskController.markPasswordForgotten(noop);
      const state = metamaskController.getState();
      expect(state.forgottenPassword).toStrictEqual(true);
    });
  });

  describe('#unMarkPasswordForgotten', () => {
    it('adds and sets forgottenPassword to config data to false', () => {
      metamaskController.unMarkPasswordForgotten(noop);
      const state = metamaskController.getState();
      expect(state.forgottenPassword).toStrictEqual(false);
    });
  });

  describe('#_onKeyringControllerUpdate', () => {
    it('should do nothing if there are no keyrings in state', async () => {
      const syncAddresses = sinon.fake();
      const syncWithAddresses = sinon.fake();
      sandbox.replace(metamaskController, 'preferencesController', {
        syncAddresses,
      });
      sandbox.replace(metamaskController, 'accountTracker', {
        syncWithAddresses,
      });

      const oldState = metamaskController.getState();
      await metamaskController._onKeyringControllerUpdate({ keyrings: [] });

      expect(syncAddresses.notCalled).toBeTruthy();
      expect(syncWithAddresses.notCalled).toBeTruthy();
      expect(metamaskController.getState()).toStrictEqual(oldState);
    });

    it('should sync addresses if there are keyrings in state', async () => {
      const syncAddresses = sinon.fake();
      const syncWithAddresses = sinon.fake();
      sandbox.replace(metamaskController, 'preferencesController', {
        syncAddresses,
      });
      sandbox.replace(metamaskController, 'accountTracker', {
        syncWithAddresses,
      });

      const oldState = metamaskController.getState();
      await metamaskController._onKeyringControllerUpdate({
        keyrings: [
          {
            accounts: ['0x1', '0x2'],
          },
        ],
      });

      expect(syncAddresses.args).toStrictEqual([[['0x1', '0x2']]]);
      expect(syncWithAddresses.args).toStrictEqual([[['0x1', '0x2']]]);
      expect(metamaskController.getState()).toStrictEqual(oldState);
    });

    it('should NOT update selected address if already unlocked', async () => {
      const syncAddresses = sinon.fake();
      const syncWithAddresses = sinon.fake();
      sandbox.replace(metamaskController, 'preferencesController', {
        syncAddresses,
      });
      sandbox.replace(metamaskController, 'accountTracker', {
        syncWithAddresses,
      });

      const oldState = metamaskController.getState();
      await metamaskController._onKeyringControllerUpdate({
        isUnlocked: true,
        keyrings: [
          {
            accounts: ['0x1', '0x2'],
          },
        ],
      });

      expect(syncAddresses.args).toStrictEqual([[['0x1', '0x2']]]);
      expect(syncWithAddresses.args).toStrictEqual([[['0x1', '0x2']]]);
      expect(metamaskController.getState()).toStrictEqual(oldState);
    });
  });

  describe('markNotificationsAsRead', () => {
    it('marks the notification as read', () => {
      metamaskController.markNotificationsAsRead([NOTIFICATION_ID]);
      const readNotification =
        metamaskController.getState().notifications[NOTIFICATION_ID];
      expect(readNotification.readDate).not.toStrictEqual(null);
    });
  });

  describe('dismissNotifications', () => {
    it('deletes the notification from state', () => {
      metamaskController.dismissNotifications([NOTIFICATION_ID]);
      const state = metamaskController.getState().notifications;
      expect(!Object.values(state).includes(NOTIFICATION_ID)).toBeTruthy();
    });
  });
});
