import browser from 'webextension-polyfill';
import {
  PLATFORM_CHROME,
  PLATFORM_EDGE,
  METAMASK_PROD_CHROME_ID,
  METAMASK_FLASK_CHROME_ID,
} from '../../shared/constants/app';
import * as util from './lib/util';
import {
  checkForMultipleVersionsRunning,
  onMessageReceived,
} from './detect-multiple-instances';

jest.mock('webextension-polyfill', () => ({
  runtime: {
    sendMessage: jest.fn(),
    id: 'pbbkamfgmaedccnfkmjcofcecjhfgldn',
  },
}));

jest.mock('./lib/util.ts');

describe('multiple instances running detector', () => {
  const PING_MESSAGE = 'isRunning';

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('checkForMultipleVersionsRunning', () => {
    it('should send ping message to multiple instances', async () => {
      util.getPlatform.mockReturnValue(PLATFORM_CHROME);
      await checkForMultipleVersionsRunning();
      expect(browser.runtime.sendMessage).toHaveBeenCalledTimes(2);

      expect(browser.runtime.sendMessage).toHaveBeenNthCalledWith(
        1,
        METAMASK_PROD_CHROME_ID,
        PING_MESSAGE,
      );

      expect(browser.runtime.sendMessage).toHaveBeenNthCalledWith(
        2,
        METAMASK_FLASK_CHROME_ID,
        PING_MESSAGE,
      );
    });

    it('should not send ping message if platform is not Chrome or Firefox', async () => {
      util.getPlatform.mockReturnValue(PLATFORM_EDGE);
      await checkForMultipleVersionsRunning();

      expect(browser.runtime.sendMessage).toHaveBeenCalledTimes(0);
    });

    it('should not expose an error outside if sendMessage throws', async () => {
      browser.runtime.sendMessage.mockRejectedValue(new Error('Test Error'));
      expect(async () => await checkForMultipleVersionsRunning()).not.toThrow();
    });
  });

  describe('onMessageReceived', () => {
    it('should print warning message to on ping message received', async () => {
      jest.spyOn(global.console, 'warn').mockImplementation();

      onMessageReceived(PING_MESSAGE);

      expect(console.warn).toHaveBeenCalledWith(
        'Warning! You have multiple instances of MetaMask running!',
      );
    });

    it('should not print warning message if wrong message received', async () => {
      jest.spyOn(global.console, 'warn').mockImplementation();

      onMessageReceived(PING_MESSAGE.concat('wrong'));

      expect(console.warn).not.toHaveBeenCalled();
    });
  });
});
