import sinon from 'sinon';
import EnsController from '.';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const ZERO_X_ERROR_ADDRESS = '0x';

describe('EnsController', () => {
  let currentChainId;
  let getCurrentChainId;
  let onNetworkDidChange;
  beforeEach(() => {
    currentChainId = '0x5';
    getCurrentChainId = () => currentChainId;
    onNetworkDidChange = sinon.spy();
  });
  afterEach(() => {
    sinon.restore();
  });
  describe('#constructor', () => {
    it('should construct the controller given a provider and a network', async () => {
      const ens = new EnsController({
        provider: sinon.fake(),
        getCurrentChainId,
        onNetworkDidChange,
      });

      expect(ens._ens).toBeTruthy();
    });

    it('should construct the controller given an existing ENS instance', async () => {
      const ens = new EnsController({
        ens: {},
        getCurrentChainId,
        onNetworkDidChange,
      });

      expect(ens._ens).toBeTruthy();
    });
  });

  describe('#reverseResolveName', () => {
    it('should resolve to an ENS name', async () => {
      const address = '0x8e5d75d60224ea0c33d0041e75de68b1c3cb6dd5';
      const ens = new EnsController({
        ens: {
          reverse: sinon.stub().withArgs(address).returns('peaksignal.eth'),
          lookup: sinon.stub().withArgs('peaksignal.eth').returns(address),
        },
        onNetworkDidChange,
        getCurrentChainId,
      });

      const name = await ens.reverseResolveAddress(address);
      expect(name).toStrictEqual('peaksignal.eth');
    });

    it('should only resolve an ENS name once', async () => {
      const address = '0x8e5d75d60224ea0c33d0041e75de68b1c3cb6dd5';
      const reverse = sinon.stub().withArgs(address).returns('peaksignal.eth');
      const lookup = sinon.stub().withArgs('peaksignal.eth').returns(address);
      const ens = new EnsController({
        ens: {
          reverse,
          lookup,
        },
        getCurrentChainId,
        onNetworkDidChange,
      });

      expect(await ens.reverseResolveAddress(address)).toStrictEqual(
        'peaksignal.eth',
      );
      expect(await ens.reverseResolveAddress(address)).toStrictEqual(
        'peaksignal.eth',
      );
      expect(lookup.calledOnce).toBeTruthy();
      expect(reverse.calledOnce).toBeTruthy();
    });

    it('should fail if the name is registered to a different address than the reverse-resolved', async () => {
      const address = '0x8e5d75d60224ea0c33d0041e75de68b1c3cb6dd5';
      const ens = new EnsController({
        ens: {
          reverse: sinon.stub().withArgs(address).returns('peaksignal.eth'),
          lookup: sinon.stub().withArgs('peaksignal.eth').returns('0x00'),
        },
        onNetworkDidChange,
        getCurrentChainId,
      });

      const name = await ens.reverseResolveAddress(address);
      expect(name).toBe(undefined);
    });

    it('should throw an error when the lookup resolves to the zero address', async () => {
      const address = '0x8e5d75d60224ea0c33d0041e75de68b1c3cb6dd5';
      const ens = new EnsController({
        ens: {
          reverse: sinon.stub().withArgs(address).returns('peaksignal.eth'),
          lookup: sinon.stub().withArgs('peaksignal.eth').returns(ZERO_ADDRESS),
        },
        getCurrentChainId,
        onNetworkDidChange,
      });

      try {
        await ens.reverseResolveAddress(address);
        expect(false).toBe(true);
      } catch (e) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(e).toBeTruthy();
      }
    });

    it('should throw an error the lookup resolves to the zero x address', async () => {
      const address = '0x8e5d75d60224ea0c33d0041e75de68b1c3cb6dd5';
      const ens = new EnsController({
        ens: {
          reverse: sinon.stub().withArgs(address).returns('peaksignal.eth'),
          lookup: sinon
            .stub()
            .withArgs('peaksignal.eth')
            .returns(ZERO_X_ERROR_ADDRESS),
        },
        onNetworkDidChange,
        getCurrentChainId,
      });

      try {
        await ens.reverseResolveAddress(address);
        expect(false).toBe(true);
      } catch (e) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(e).toBeTruthy();
      }
    });
  });
});
