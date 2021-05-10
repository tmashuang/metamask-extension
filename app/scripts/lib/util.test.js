import { isPrefixedFormattedHexString } from '../../../shared/modules/network.utils';

import {
  ENVIRONMENT_TYPE_POPUP,
  ENVIRONMENT_TYPE_NOTIFICATION,
  ENVIRONMENT_TYPE_FULLSCREEN,
  ENVIRONMENT_TYPE_BACKGROUND,
} from '../../../shared/constants/app';
import { getEnvironmentType } from './util';

describe('app utils', () => {
  describe('getEnvironmentType', () => {
    it('should return popup type', () => {
      const environmentType = getEnvironmentType(
        'http://extension-id/popup.html',
      );
      expect(environmentType).toStrictEqual(ENVIRONMENT_TYPE_POPUP);
    });

    it('should return notification type', () => {
      const environmentType = getEnvironmentType(
        'http://extension-id/notification.html',
      );
      expect(environmentType).toStrictEqual(ENVIRONMENT_TYPE_NOTIFICATION);
    });

    it('should return fullscreen type for home.html', () => {
      const environmentType = getEnvironmentType(
        'http://extension-id/home.html',
      );
      expect(environmentType).toStrictEqual(ENVIRONMENT_TYPE_FULLSCREEN);
    });

    it('should return fullscreen type for phishing.html', () => {
      const environmentType = getEnvironmentType(
        'http://extension-id/phishing.html',
      );
      expect(environmentType).toStrictEqual(ENVIRONMENT_TYPE_FULLSCREEN);
    });

    it('should return background type', () => {
      const environmentType = getEnvironmentType(
        'http://extension-id/_generated_background_page.html',
      );
      expect(environmentType).toStrictEqual(ENVIRONMENT_TYPE_BACKGROUND);
    });

    it('should return the correct type for a URL with a hash fragment', () => {
      const environmentType = getEnvironmentType(
        'http://extension-id/popup.html#hash',
      );
      expect(environmentType).toStrictEqual(ENVIRONMENT_TYPE_POPUP);
    });

    it('should return the correct type for a URL with query parameters', () => {
      const environmentType = getEnvironmentType(
        'http://extension-id/popup.html?param=foo',
      );
      expect(environmentType).toStrictEqual(ENVIRONMENT_TYPE_POPUP);
    });

    it('should return the correct type for a URL with query parameters and a hash fragment', () => {
      const environmentType = getEnvironmentType(
        'http://extension-id/popup.html?param=foo#hash',
      );
      expect(environmentType).toStrictEqual(ENVIRONMENT_TYPE_POPUP);
    });
  });

describe('isPrefixedFormattedHexString', () => {
  it('should return true for valid hex strings', () => {
    expect(isPrefixedFormattedHexString('0x1')).toStrictEqual(true);

      expect(isPrefixedFormattedHexString('0xa')).toStrictEqual(true);

      expect(
        isPrefixedFormattedHexString('0xabcd1123fae909aad87452'),
      ).toStrictEqual(true);
    });

    it('should return false for invalid hex strings', () => {
      expect(isPrefixedFormattedHexString('0x')).toStrictEqual(false);

      expect(isPrefixedFormattedHexString('0x0')).toStrictEqual(false);

      expect(isPrefixedFormattedHexString('0x01')).toStrictEqual(false);

      expect(isPrefixedFormattedHexString(' 0x1')).toStrictEqual(false);

      expect(isPrefixedFormattedHexString('0x1 ')).toStrictEqual(false);

      expect(isPrefixedFormattedHexString('0x1afz')).toStrictEqual(false);

      expect(isPrefixedFormattedHexString('z')).toStrictEqual(false);

      expect(isPrefixedFormattedHexString(2)).toStrictEqual(false);

      expect(isPrefixedFormattedHexString(['0x1'])).toStrictEqual(false);

      expect(isPrefixedFormattedHexString()).toStrictEqual(false);
    });
  });
});
