import sinon from 'sinon';
import { ControllerMessenger } from '@metamask/base-controller';
import { TokenListController } from '@metamask/assets-controllers';
import { CHAIN_IDS } from '../../../shared/constants/network';
import PreferencesController from './preferences';
import NetworkController from './network';

describe('preferences controller', () => {
  let preferencesController;
  let network;
  let currentChainId;
  let provider;
  let tokenListController;

  beforeEach(() => {
    const sandbox = sinon.createSandbox();
    currentChainId = CHAIN_IDS.MAINNET;
    const networkControllerProviderConfig = {
      getAccounts: () => undefined,
    };
    network = new NetworkController({ infuraProjectId: 'foo' });
    network.initializeProvider(networkControllerProviderConfig);
    provider = network.getProviderAndBlockTracker().provider;
    const tokenListMessenger = new ControllerMessenger().getRestricted({
      name: 'TokenListController',
    });
    tokenListController = new TokenListController({
      chainId: '1',
      preventPollingOnNetworkRestart: false,
      onNetworkStateChange: jest.fn(),
      onPreferencesStateChange: jest.fn(),
      messenger: tokenListMessenger,
    });

    sandbox
      .stub(network, '_getLatestBlock')
      .callsFake(() => Promise.resolve({}));
    sandbox.stub(network, 'getCurrentChainId').callsFake(() => currentChainId);
    sandbox
      .stub(network, 'getProviderConfig')
      .callsFake(() => ({ type: 'mainnet' }));

    preferencesController = new PreferencesController({
      initLangCode: 'en_US',
      network,
      provider,
      tokenListController,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('useBlockie', () => {
    it('defaults useBlockie to false', () => {
      expect(preferencesController.store.getState().useBlockie).toStrictEqual(
        false,
      );
    });

    it('setUseBlockie to true', () => {
      preferencesController.setUseBlockie(true);
      expect(preferencesController.store.getState().useBlockie).toStrictEqual(
        true,
      );
    });
  });

  describe('setCurrentLocale', () => {
    it('checks the default currentLocale', () => {
      const { currentLocale } = preferencesController.store.getState();
      expect(currentLocale).toStrictEqual('en_US');
    });

    it('sets current locale in preferences controller', () => {
      preferencesController.setCurrentLocale('ja');
      const { currentLocale } = preferencesController.store.getState();
      expect(currentLocale).toStrictEqual('ja');
    });
  });

  describe('setAddresses', () => {
    it('should keep a map of addresses to names and addresses in the store', () => {
      preferencesController.setAddresses(['0xda22le', '0x7e57e2']);

      const { identities } = preferencesController.store.getState();
      expect(identities).toStrictEqual({
        '0xda22le': {
          name: 'Account 1',
          address: '0xda22le',
        },
        '0x7e57e2': {
          name: 'Account 2',
          address: '0x7e57e2',
        },
      });
    });

    it('should replace its list of addresses', () => {
      preferencesController.setAddresses(['0xda22le', '0x7e57e2']);
      preferencesController.setAddresses(['0xda22le77', '0x7e57e277']);

      const { identities } = preferencesController.store.getState();
      expect(identities).toStrictEqual({
        '0xda22le77': {
          name: 'Account 1',
          address: '0xda22le77',
        },
        '0x7e57e277': {
          name: 'Account 2',
          address: '0x7e57e277',
        },
      });
    });
  });

  describe('removeAddress', () => {
    it('should remove an address from state', () => {
      preferencesController.setAddresses(['0xda22le', '0x7e57e2']);

      preferencesController.removeAddress('0xda22le');

      expect(
        preferencesController.store.getState().identities['0xda22le'],
      ).toStrictEqual(undefined);
    });

    it('should switch accounts if the selected address is removed', () => {
      preferencesController.setAddresses(['0xda22le', '0x7e57e2']);

      preferencesController.setSelectedAddress('0x7e57e2');
      preferencesController.removeAddress('0x7e57e2');

      expect(preferencesController.getSelectedAddress()).toStrictEqual(
        '0xda22le',
      );
    });
  });

  describe('setAccountLabel', () => {
    it('should update a label for the given account', () => {
      preferencesController.setAddresses(['0xda22le', '0x7e57e2']);

      expect(
        preferencesController.store.getState().identities['0xda22le'],
      ).toStrictEqual({
        name: 'Account 1',
        address: '0xda22le',
      });

      preferencesController.setAccountLabel('0xda22le', 'Dazzle');
      expect(
        preferencesController.store.getState().identities['0xda22le'],
      ).toStrictEqual({
        name: 'Dazzle',
        address: '0xda22le',
      });
    });
  });

  describe('setPasswordForgotten', () => {
    it('should default to false', () => {
      const state = preferencesController.store.getState();
      expect(state.forgottenPassword).toStrictEqual(false);
    });

    it('should set the forgottenPassword property in state', () => {
      expect(
        preferencesController.store.getState().forgottenPassword,
      ).toStrictEqual(false);

      preferencesController.setPasswordForgotten(true);

      expect(
        preferencesController.store.getState().forgottenPassword,
      ).toStrictEqual(true);
    });
  });

  describe('adding and removing from frequentRpcListDetail', () => {
    it('should add custom RPC url to state', () => {
      preferencesController.upsertToFrequentRpcList('rpc_url', '0x1');
      expect(
        preferencesController.store.getState().frequentRpcListDetail,
      ).toStrictEqual([
        {
          rpcUrl: 'rpc_url',
          chainId: '0x1',
          ticker: 'ETH',
          nickname: '',
          rpcPrefs: {},
        },
      ]);
      preferencesController.upsertToFrequentRpcList('rpc_url', '0x1');
      expect(
        preferencesController.store.getState().frequentRpcListDetail,
      ).toStrictEqual([
        {
          rpcUrl: 'rpc_url',
          chainId: '0x1',
          ticker: 'ETH',
          nickname: '',
          rpcPrefs: {},
        },
      ]);
    });

    it('should throw if chainId is invalid', () => {
      expect(() => {
        preferencesController.upsertToFrequentRpcList('rpc_url', '1');
      }).toThrow('');
    });

    it('should remove custom RPC url from state', () => {
      preferencesController.upsertToFrequentRpcList('rpc_url', '0x1');
      expect(
        preferencesController.store.getState().frequentRpcListDetail,
      ).toStrictEqual([
        {
          rpcUrl: 'rpc_url',
          chainId: '0x1',
          ticker: 'ETH',
          nickname: '',
          rpcPrefs: {},
        },
      ]);
      preferencesController.removeFromFrequentRpcList('other_rpc_url');
      preferencesController.removeFromFrequentRpcList('http://localhost:8545');
      preferencesController.removeFromFrequentRpcList('rpc_url');
      expect(
        preferencesController.store.getState().frequentRpcListDetail,
      ).toStrictEqual([]);
    });
  });

  describe('setUsePhishDetect', () => {
    it('should default to true', () => {
      const state = preferencesController.store.getState();
      expect(state.usePhishDetect).toStrictEqual(true);
    });

    it('should set the usePhishDetect property in state', () => {
      expect(
        preferencesController.store.getState().usePhishDetect,
      ).toStrictEqual(true);
      preferencesController.setUsePhishDetect(false);
      expect(
        preferencesController.store.getState().usePhishDetect,
      ).toStrictEqual(false);
    });
  });

  describe('setUseMultiAccountBalanceChecker', () => {
    it('should default to true', () => {
      const state = preferencesController.store.getState();
      expect(state.useMultiAccountBalanceChecker).toStrictEqual(true);
    });

    it('should set the setUseMultiAccountBalanceChecker property in state', () => {
      expect(
        preferencesController.store.getState().useMultiAccountBalanceChecker,
      ).toStrictEqual(true);

      preferencesController.setUseMultiAccountBalanceChecker(false);

      expect(
        preferencesController.store.getState().useMultiAccountBalanceChecker,
      ).toStrictEqual(false);
    });
  });

  describe('setUseTokenDetection', () => {
    it('should default to false', () => {
      const state = preferencesController.store.getState();
      expect(state.useTokenDetection).toStrictEqual(false);
    });

    it('should set the useTokenDetection property in state', () => {
      expect(
        preferencesController.store.getState().useTokenDetection,
      ).toStrictEqual(false);
      preferencesController.setUseTokenDetection(true);
      expect(
        preferencesController.store.getState().useTokenDetection,
      ).toStrictEqual(true);
    });
  });

  describe('setUseNftDetection', () => {
    it('should default to false', () => {
      const state = preferencesController.store.getState();
      expect(state.useNftDetection).toStrictEqual(false);
    });

    it('should set the useNftDetection property in state', () => {
      expect(
        preferencesController.store.getState().useNftDetection,
      ).toStrictEqual(false);
      preferencesController.setOpenSeaEnabled(true);
      preferencesController.setUseNftDetection(true);
      expect(
        preferencesController.store.getState().useNftDetection,
      ).toStrictEqual(true);
    });
  });

  describe('setOpenSeaEnabled', () => {
    it('should default to false', () => {
      const state = preferencesController.store.getState();
      expect(state.openSeaEnabled).toStrictEqual(false);
    });

    it('should set the openSeaEnabled property in state', () => {
      expect(
        preferencesController.store.getState().openSeaEnabled,
      ).toStrictEqual(false);
      preferencesController.setOpenSeaEnabled(true);
      expect(
        preferencesController.store.getState().openSeaEnabled,
      ).toStrictEqual(true);
    });
  });

  describe('setAdvancedGasFee', () => {
    it('should default to null', () => {
      const state = preferencesController.store.getState();
      expect(state.advancedGasFee).toStrictEqual(null);
    });

    it('should set the setAdvancedGasFee property in state', () => {
      const state = preferencesController.store.getState();
      expect(state.advancedGasFee).toStrictEqual(null);
      preferencesController.setAdvancedGasFee({
        maxBaseFee: '1.5',
        priorityFee: '2',
      });
      expect(
        preferencesController.store.getState().advancedGasFee.maxBaseFee,
      ).toStrictEqual('1.5');
      expect(
        preferencesController.store.getState().advancedGasFee.priorityFee,
      ).toStrictEqual('2');
    });
  });

  describe('setTheme', () => {
    it('should default to value "OS"', () => {
      const state = preferencesController.store.getState();
      expect(state.theme).toStrictEqual('os');
    });

    it('should set the setTheme property in state', () => {
      const state = preferencesController.store.getState();
      expect(state.theme).toStrictEqual('os');
      preferencesController.setTheme('dark');
      expect(preferencesController.store.getState().theme).toStrictEqual(
        'dark',
      );
    });
  });

  describe('setUseCurrencyRateCheck', () => {
    it('should default to false', () => {
      const state = preferencesController.store.getState();
      expect(state.useCurrencyRateCheck).toBeTruthy();
    });

    it('should set the useCurrencyRateCheck property in state', () => {
      expect(
        preferencesController.store.getState().useCurrencyRateCheck,
      ).toBeTruthy();
      preferencesController.setUseCurrencyRateCheck(false);
      expect(
        preferencesController.store.getState().useCurrencyRateCheck,
      ).toBeFalsy();
    });
  });
});
