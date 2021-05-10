import sinon from 'sinon';
import { getNetworkDisplayName } from './util';
import NetworkController, { NETWORK_EVENTS } from './network';

describe('NetworkController', () => {
  describe('controller', () => {
    let networkController;
    let getLatestBlockStub;
    let setProviderTypeAndWait;
    const noop = () => undefined;
    const networkControllerProviderConfig = {
      getAccounts: noop,
    };

    beforeEach(() => {
      networkController = new NetworkController();
      getLatestBlockStub = sinon
        .stub(networkController, 'getLatestBlock')
        .callsFake(() => Promise.resolve({}));
      networkController.setInfuraProjectId('foo');
      setProviderTypeAndWait = () =>
        new Promise((resolve) => {
          networkController.on(NETWORK_EVENTS.NETWORK_DID_CHANGE, () => {
            resolve();
          });
          networkController.setProviderType('mainnet');
        });
    });

    afterEach(function () {
      getLatestBlockStub.reset();
    });

    describe('#provider', () => {
      it('provider should be updatable without reassignment', () => {
        networkController.initializeProvider(networkControllerProviderConfig);
        const providerProxy = networkController.getProviderAndBlockTracker()
          .provider;
        expect(providerProxy.test).toBeUndefined();
        providerProxy.setTarget({ test: true });
        expect(providerProxy.test).toStrictEqual(true);
      });
    });

    describe('#getNetworkState', () => {
      it('should return "loading" when new', () => {
        const networkState = networkController.getNetworkState();
        expect(networkState).toStrictEqual('loading');
      });
    });

    describe('#setNetworkState', () => {
      it('should update the network', () => {
        networkController.setNetworkState('1');
        const networkState = networkController.getNetworkState();
        expect(networkState).toStrictEqual('1');
      });
    });

    describe('#setProviderType', () => {
      it('should update provider.type', () => {
        networkController.initializeProvider(networkControllerProviderConfig);
        networkController.setProviderType('mainnet');
        const { type } = networkController.getProviderConfig();
        expect(type).toStrictEqual('mainnet');
      });

      it('should set the network to loading', () => {
        networkController.initializeProvider(networkControllerProviderConfig);

        const spy = sinon.spy(networkController, 'setNetworkState');
        networkController.setProviderType('mainnet');

        expect(spy.callCount).toStrictEqual(1);
        expect(spy.calledOnceWithExactly('loading')).toStrictEqual(true);
      });
    });

    describe('#getEIP1559Compatibility', function () {
      it('should return false when baseFeePerGas is not in the block header', async function () {
        networkController.initializeProvider(networkControllerProviderConfig);
        const supportsEIP1559 = await networkController.getEIP1559Compatibility();
        assert.equal(supportsEIP1559, false);
      });

      it('should return true when baseFeePerGas is in block header', async function () {
        networkController.initializeProvider(networkControllerProviderConfig);
        getLatestBlockStub.callsFake(() =>
          Promise.resolve({ baseFeePerGas: '0xa ' }),
        );
        const supportsEIP1559 = await networkController.getEIP1559Compatibility();
        assert.equal(supportsEIP1559, true);
      });

      it('should store EIP1559 support in state to reduce calls to getLatestBlock', async function () {
        networkController.initializeProvider(networkControllerProviderConfig);
        getLatestBlockStub.callsFake(() =>
          Promise.resolve({ baseFeePerGas: '0xa ' }),
        );
        await networkController.getEIP1559Compatibility();
        const supportsEIP1559 = await networkController.getEIP1559Compatibility();
        assert.equal(getLatestBlockStub.calledOnce, true);
        assert.equal(supportsEIP1559, true);
      });

      it('should clear stored EIP1559 support when changing networks', async function () {
        networkController.initializeProvider(networkControllerProviderConfig);
        networkController.consoleThis = true;
        getLatestBlockStub.callsFake(() =>
          Promise.resolve({ baseFeePerGas: '0xa ' }),
        );
        await networkController.getEIP1559Compatibility();
        assert.equal(
          networkController.networkDetails.getState().EIPS[1559],
          true,
        );
        getLatestBlockStub.callsFake(() => Promise.resolve({}));
        await setProviderTypeAndWait('mainnet');
        assert.equal(
          networkController.networkDetails.getState().EIPS[1559],
          undefined,
        );
        await networkController.getEIP1559Compatibility();
        assert.equal(
          networkController.networkDetails.getState().EIPS[1559],
          false,
        );
        assert.equal(getLatestBlockStub.calledTwice, true);
      });
    });
  });

  describe('utils', () => {
    it('getNetworkDisplayName should return the correct network name', () => {
      const tests = [
        {
          input: '3',
          expected: 'Ropsten',
        },
        {
          input: '4',
          expected: 'Rinkeby',
        },
        {
          input: '42',
          expected: 'Kovan',
        },
        {
          input: '0x3',
          expected: 'Ropsten',
        },
        {
          input: '0x4',
          expected: 'Rinkeby',
        },
        {
          input: '0x2a',
          expected: 'Kovan',
        },
        {
          input: 'ropsten',
          expected: 'Ropsten',
        },
        {
          input: 'rinkeby',
          expected: 'Rinkeby',
        },
        {
          input: 'kovan',
          expected: 'Kovan',
        },
        {
          input: 'mainnet',
          expected: 'Ethereum Mainnet',
        },
        {
          input: 'goerli',
          expected: 'Goerli',
        },
      ];

      tests.forEach(({ input, expected }) =>
        expect(getNetworkDisplayName(input)).toStrictEqual(expected),
      );
    });
  });
});
