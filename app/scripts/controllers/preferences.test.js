import sinon from 'sinon';
import { MAINNET_CHAIN_ID } from '../../../shared/constants/network';
import PreferencesController from './preferences';
import NetworkController from './network';

describe('preferences controller', () => {
  let preferencesController;
  let network;
  let currentChainId;
  let provider;
  const migrateAddressBookState = sinon.stub();

  beforeEach(() => {
    const sandbox = sinon.createSandbox();
    currentChainId = MAINNET_CHAIN_ID;
    const networkControllerProviderConfig = {
      getAccounts: () => undefined,
    };
    network = new NetworkController();
    network.setInfuraProjectId('foo');
    network.initializeProvider(networkControllerProviderConfig);
    provider = network.getProviderAndBlockTracker().provider;

    sandbox
      .stub(network, 'getLatestBlock')
      .callsFake(() => Promise.resolve({}));
    sandbox.stub(network, 'getCurrentChainId').callsFake(() => currentChainId);
    sandbox
      .stub(network, 'getProviderConfig')
      .callsFake(() => ({ type: 'mainnet' }));

    preferencesController = new PreferencesController({
      initLangCode: 'en_US',
      migrateAddressBookState,
      network,
      provider,
    });
  });

  afterEach(() => {
    sinon.restore();
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
      ).toBeUndefined();
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

  describe('#updateRpc', () => {
    it('should update the rpcDetails properly', async () => {
      preferencesController.store.updateState({
        frequentRpcListDetail: [{}, { rpcUrl: 'test', chainId: '0x1' }, {}],
      });
      await preferencesController.updateRpc({ rpcUrl: 'test', chainId: '0x1' });
      await preferencesController.updateRpc({
        rpcUrl: 'test/1',
        chainId: '0x1',
      });
      await preferencesController.updateRpc({
        rpcUrl: 'test/2',
        chainId: '0x1',
      });
      await preferencesController.updateRpc({
        rpcUrl: 'test/3',
        chainId: '0x1',
      });
      const list = preferencesController.getFrequentRpcListDetail();
      expect(list[1]).toStrictEqual({ rpcUrl: 'test', chainId: '0x1' });
    });

    it('should migrate address book entries if chainId changes', async () => {
      preferencesController.store.updateState({
        frequentRpcListDetail: [{}, { rpcUrl: 'test', chainId: '1' }, {}],
      });
      await preferencesController.updateRpc({ rpcUrl: 'test', chainId: '0x1' });
      expect(migrateAddressBookState.calledWith('1', '0x1')).toStrictEqual(
        true,
      );
    });
  });

  describe('adding and removing from frequentRpcListDetail', () => {
    it('should add custom RPC url to state', () => {
      preferencesController.addToFrequentRpcList('rpc_url', '0x1');
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
      preferencesController.addToFrequentRpcList('rpc_url', '0x1');
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

    it('should throw if chainId is invalid', async () => {
      await expect(() => {
        preferencesController.addToFrequentRpcList('rpc_url', '1');
      }).toThrow('Invalid chainId: "1"');
    });

    it('should remove custom RPC url from state', () => {
      preferencesController.addToFrequentRpcList('rpc_url', '0x1');
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
  describe('setUseTokenDetection', () => {
    it('should default to true', () => {
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

  describe('setUseCollectibleDetection', () => {
    it('should default to false', () => {
      const state = preferencesController.store.getState();
      expect(state.useCollectibleDetection).toStrictEqual(false);
    });

    it('should set the useCollectibleDetection property in state', () => {
      expect(
        preferencesController.store.getState().useCollectibleDetection,
      ).toStrictEqual(false);
      preferencesController.setOpenSeaEnabled(true);
      preferencesController.setUseCollectibleDetection(true);
      expect(
        preferencesController.store.getState().useCollectibleDetection,
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
      expect(state.advancedGasFee).toBeNull();
    });

    it('should set the setAdvancedGasFee property in state', () => {
      const state = preferencesController.store.getState();
      expect(state.advancedGasFee).toBeNull();
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
});
